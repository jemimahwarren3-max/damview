-- PENDING - run this yourself in the Supabase SQL editor (Claude Code's auto-mode
-- classifier blocked apply_migration for this one, same as the earlier identity
-- migration - it touches EXECUTE grants and the payment-verification trigger).
--
-- What this does:
-- 1. Fixes "mutable search_path" security warnings on 5 existing functions.
-- 2. Adds real room checkout: rooms.booked_until + check_out_room()/release_expired_bookings().
-- 3. Tightens EXECUTE grants so only the public enquiry form's function (hold_room_for_enquiry)
--    is callable by anon - everything else becomes authenticated (staff) only.
-- 4. Adds atomic, race-free document numbering (document_counters + next_document_number()).
-- 5. Adds activity_enquiries.price_amount so activity revenue can actually be reported.
--
-- Safe to run once. All statements are idempotent (create-or-replace / if-not-exists).

-- 1. Fix mutable search_path on existing SECURITY DEFINER functions (security advisor WARN)
create or replace function hold_room_for_enquiry(p_block_id text, p_enquiry_id uuid, p_hold_minutes integer default 30)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id text;
begin
  update rooms
  set status = 'available', hold_expires_at = null, held_by_enquiry_id = null
  where block_id = p_block_id and status = 'held' and hold_expires_at < now();

  select id into v_room_id
  from rooms
  where block_id = p_block_id and status = 'available'
  order by number
  limit 1
  for update skip locked;

  if v_room_id is null then
    return null;
  end if;

  update rooms
  set status = 'held', hold_expires_at = now() + (p_hold_minutes || ' minutes')::interval, held_by_enquiry_id = p_enquiry_id
  where id = v_room_id;

  update lodge_enquiries set room_id = v_room_id where id = p_enquiry_id;

  return v_room_id;
end;
$$;

-- 2. Room checkout support: track when a booked room's stay ends
alter table rooms add column if not exists booked_until timestamptz;

create or replace function confirm_room_booking(p_room_id text) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_hours integer;
begin
  select rb.stay_duration_hours into v_hours
  from rooms r join room_blocks rb on rb.id = r.block_id
  where r.id = p_room_id;

  update rooms
  set status = 'booked',
      hold_expires_at = null,
      held_by_enquiry_id = null,
      booked_until = now() + (coalesce(v_hours, 2) || ' hours')::interval
  where id = p_room_id;
end;
$$;

create or replace function release_room_hold(p_room_id text) returns void
language sql security definer set search_path = public as $$
  update rooms set status = 'available', hold_expires_at = null, held_by_enquiry_id = null
  where id = p_room_id and status = 'held';
$$;

create or replace function release_expired_holds() returns void
language sql security definer set search_path = public as $$
  update rooms set status = 'available', hold_expires_at = null, held_by_enquiry_id = null
  where status = 'held' and hold_expires_at < now();
$$;

-- Manual + auto checkout: free a room whose stay has ended
create or replace function check_out_room(p_room_id text) returns void
language sql security definer set search_path = public as $$
  update rooms set status = 'available', booked_until = null
  where id = p_room_id and status = 'booked';
$$;

create or replace function release_expired_bookings() returns void
language sql security definer set search_path = public as $$
  update rooms set status = 'available', booked_until = null
  where status = 'booked' and booked_until < now();
$$;

create or replace function enforce_payment_verification_admin_only() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (new.payment_status = 'VERIFIED' and (old.payment_status is distinct from 'VERIFIED'))
     or (new.payment_status = 'REJECTED' and (old.payment_status is distinct from 'REJECTED')) then
    if not is_staff_admin() then
      raise exception 'Only an admin can verify or reject a payment';
    end if;
  end if;
  return new;
end;
$$;

-- 3. Tighten EXECUTE grants: anon only needs the one function the public enquiry form calls
revoke execute on function confirm_room_booking(text) from anon;
revoke execute on function release_room_hold(text) from anon;
revoke execute on function release_expired_holds() from anon;
revoke execute on function enforce_payment_verification_admin_only() from anon, authenticated;
grant execute on function check_out_room(text) to authenticated;
grant execute on function release_expired_bookings() to authenticated;
revoke execute on function check_out_room(text) from anon;
revoke execute on function release_expired_bookings() from anon;

-- 4. Atomic document numbering (replaces racy count-then-insert in app code)
create table if not exists document_counters (
  document_type text primary key,
  next_number integer not null default 1
);
alter table document_counters enable row level security;

create or replace function next_document_number(p_document_type text) returns integer
language sql security definer set search_path = public as $$
  insert into document_counters (document_type, next_number)
  values (p_document_type, 2)
  on conflict (document_type) do update set next_number = document_counters.next_number + 1
  returning next_number - 1;
$$;
revoke execute on function next_document_number(text) from anon;
grant execute on function next_document_number(text) to authenticated;

-- 5. Capture real activity revenue at enquiry time (price wasn't stored anywhere before)
alter table activity_enquiries add column if not exists price_amount numeric;
