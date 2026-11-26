-- ================================================================
-- DAMVIEW RESORT — WEBSITE SCHEMA (fresh install)
-- Tables for the public-facing website: accommodation, enquiries,
-- payments, gallery, reviews, gym, events, activities, documents.
--
-- NOTE: tables are named website_rooms and website_activities to
-- avoid collision with the Hospiq PMS tables (rooms, activities).
-- ================================================================

create extension if not exists pgcrypto;

-- ===== Accommodation =====

create table room_blocks (
  id text primary key,
  name text not null,
  display_name text not null,
  rate_per_stay numeric(10, 2) not null,
  stay_duration_hours integer not null
);

create table website_rooms (
  id text primary key,
  block_id text not null references room_blocks(id) on delete cascade,
  number text not null,
  status text not null default 'available' check (status in ('available', 'held', 'booked', 'maintenance')),
  hold_expires_at timestamptz,
  held_by_enquiry_id uuid,
  booked_until timestamptz
);

create table lodge_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'declined')),
  created_at timestamptz not null default now(),
  block_id text references room_blocks(id),
  check_in date not null,
  guests integer not null,
  room_id text references website_rooms(id),
  booking_reference text,
  booked_hours integer,
  customer_id uuid
);

create unique index if not exists lodge_enquiries_booking_reference_idx
  on lodge_enquiries (booking_reference) where booking_reference is not null;

-- ===== Gym =====

create table gym_packages (
  id text primary key,
  name text not null,
  price numeric(10, 2),
  billing_period text not null check (billing_period in ('session', 'month', 'year')),
  features text[] not null default '{}'
);

create table gym_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'declined')),
  created_at timestamptz not null default now(),
  package_id text references gym_packages(id),
  customer_id uuid
);

-- ===== Restaurant =====

create table menu_categories (
  id text primary key,
  name text not null
);

create table menu_items (
  id text primary key,
  category_id text not null references menu_categories(id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null,
  description text,
  image text,
  available boolean not null default true
);

-- ===== Activities =====

create table website_activities (
  id text primary key,
  category text not null check (category in ('damside', 'recreational')),
  name text not null,
  description text not null,
  price_amount numeric(10, 2),
  price_unit text check (price_unit in ('per_person', 'per_hour', 'per_session', 'free')),
  image text
);

create table activity_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'declined')),
  created_at timestamptz not null default now(),
  activity_id text not null references website_activities(id),
  preferred_date date,
  party_size integer,
  price_amount numeric,
  customer_id uuid
);

-- ===== Events =====

create table event_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'declined')),
  created_at timestamptz not null default now(),
  event_type text not null check (
    event_type in ('wedding', 'birthday', 'private_party', 'family_gathering', 'corporate', 'conference', 'other')
  ),
  proposed_date date not null,
  expected_guests integer not null,
  facilities_required text[] not null default '{}',
  catering_required boolean not null default false,
  accommodation_required boolean not null default false,
  booking_reference text,
  customer_id uuid
);

create unique index if not exists event_enquiries_booking_reference_idx
  on event_enquiries (booking_reference) where booking_reference is not null;

-- ===== Gallery =====

create table gallery_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (
    category in ('accommodation', 'pool', 'restaurant', 'gym', 'waterfront', 'activities', 'events', 'general')
  ),
  type text not null check (type in ('image', 'video')),
  url text not null,
  caption text,
  created_at timestamptz not null default now()
);

-- ===== Guest Reviews =====

create table guest_reviews (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  rating smallint not null check (rating between 1 and 5),
  quote text not null,
  image text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- ===== Staff (website admin — separate from Hospiq users table) =====

create table staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('director', 'general_manager', 'managerial_officer', 'department_head', 'employee')),
  department text,
  is_admin boolean not null default false,
  is_active boolean not null default true
);

-- ===== Financial Documents =====

create table documents (
  id uuid primary key default gen_random_uuid(),
  document_type text not null check (document_type in ('quotation', 'invoice', 'receipt')),
  document_number text not null unique,
  customer_name text not null,
  issue_date date not null default current_date,
  amount_paid numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table document_line_items (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(10, 2) not null
);

create table document_counters (
  document_type text primary key,
  next_number integer not null default 1
);

-- ===== Customers (lightweight dedup by phone) =====

create table customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  normalized_phone text not null,
  email text,
  phone_verification_status text not null default 'UNVERIFIED' check (phone_verification_status in ('UNVERIFIED', 'VERIFIED')),
  record_status text not null default 'active' check (record_status in ('active', 'merged', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_normalized_phone_idx on customers (normalized_phone);

-- Add customer FK to enquiry tables
alter table lodge_enquiries add constraint lodge_enquiries_customer_id_fkey foreign key (customer_id) references customers(id);
alter table event_enquiries add constraint event_enquiries_customer_id_fkey foreign key (customer_id) references customers(id);
alter table activity_enquiries add constraint activity_enquiries_customer_id_fkey foreign key (customer_id) references customers(id);
alter table gym_enquiries add constraint gym_enquiries_customer_id_fkey foreign key (customer_id) references customers(id);

-- ===== Payment System =====

create table payment_settings (
  id boolean primary key default true check (id = true),
  merchant_name text not null default '',
  merchant_code text not null default '',
  merchant_instructions text not null default '',
  manual_verification_enabled boolean not null default true,
  payment_deadline_hours integer not null default 24,
  room_hold_minutes integer not null default 30,
  upload_max_mb integer not null default 5,
  updated_at timestamptz not null default now()
);

insert into payment_settings (id) values (true) on conflict do nothing;

create table payment_submissions (
  id uuid primary key default gen_random_uuid(),
  payment_reference text not null unique,
  lodge_enquiry_id uuid references lodge_enquiries(id),
  event_enquiry_id uuid references event_enquiries(id),
  customer_id uuid references customers(id),
  enquiry_type text not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_ecocash_number text,
  expected_amount numeric(10, 2) not null,
  amount_claimed numeric(10, 2),
  currency text not null default 'USD',
  payment_method text not null,
  payment_status text not null default 'PENDING' check (
    payment_status in ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'EXPIRED')
  ),
  ecocash_transaction_reference text,
  proof_file_path text,
  proof_file_type text,
  receipt_number text,
  payment_deadline timestamptz not null,
  submitted_at timestamptz,
  verified_at timestamptz,
  verified_by uuid references auth.users(id),
  rejected_at timestamptz,
  rejected_by uuid references auth.users(id),
  rejection_reason text,
  access_token_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists payment_submissions_ecocash_transaction_reference_idx
  on payment_submissions (ecocash_transaction_reference)
  where ecocash_transaction_reference is not null;

create table payment_audit_log (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payment_submissions(id),
  action text not null,
  previous_status text,
  new_status text not null,
  performed_by uuid references auth.users(id),
  reason text,
  created_at timestamptz not null default now()
);

-- ===== RLS =====

alter table room_blocks enable row level security;
alter table website_rooms enable row level security;
alter table lodge_enquiries enable row level security;
alter table gym_packages enable row level security;
alter table gym_enquiries enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table website_activities enable row level security;
alter table activity_enquiries enable row level security;
alter table event_enquiries enable row level security;
alter table gallery_items enable row level security;
alter table guest_reviews enable row level security;
alter table staff_profiles enable row level security;
alter table documents enable row level security;
alter table document_line_items enable row level security;
alter table document_counters enable row level security;
alter table customers enable row level security;
alter table payment_settings enable row level security;
alter table payment_submissions enable row level security;
alter table payment_audit_log enable row level security;

-- Staff admin helper
create or replace function is_staff_admin() returns boolean
language sql security definer stable
set search_path = public
as $$
  select coalesce((select is_admin and is_active from staff_profiles where user_id = auth.uid()), false);
$$;

-- Public read policies (website visitors)
create policy "public read room_blocks" on room_blocks for select to anon, authenticated using (true);
create policy "public read website_rooms" on website_rooms for select to anon, authenticated using (true);
create policy "public read gym_packages" on gym_packages for select to anon, authenticated using (true);
create policy "public read menu_categories" on menu_categories for select to anon, authenticated using (true);
create policy "public read menu_items" on menu_items for select to anon, authenticated using (true);
create policy "public read website_activities" on website_activities for select to anon, authenticated using (true);
create policy "public read gallery_items" on gallery_items for select to anon, authenticated using (true);
create policy "public read approved reviews" on guest_reviews for select to anon, authenticated using (status = 'approved');
create policy "public read payment_settings" on payment_settings for select to anon, authenticated using (true);

-- Public insert policies (enquiry forms)
create policy "public insert lodge_enquiries" on lodge_enquiries for insert to anon, authenticated with check (true);
create policy "public insert gym_enquiries" on gym_enquiries for insert to anon, authenticated with check (true);
create policy "public insert activity_enquiries" on activity_enquiries for insert to anon, authenticated with check (true);
create policy "public insert event_enquiries" on event_enquiries for insert to anon, authenticated with check (true);
create policy "public insert guest_reviews" on guest_reviews for insert to anon, authenticated with check (status = 'pending');
create policy "public insert customers" on customers for insert to public with check (true);
create policy "public read customers" on customers for select to public using (true);
create policy "public insert payment_submissions" on payment_submissions for insert to anon, authenticated with check (true);
create policy "public read own payment" on payment_submissions for select to anon, authenticated using (true);
create policy "public update own payment" on payment_submissions for update to anon, authenticated using (payment_status in ('PENDING', 'SUBMITTED')) with check (true);

-- Staff policies
create policy "staff manage staff_profiles" on staff_profiles for select to authenticated using (true);
create policy "self insert staff_profiles" on staff_profiles for insert to authenticated
  with check (user_id = auth.uid() and (is_admin = false or not exists (select 1 from staff_profiles)));
create policy "self update own staff_profile" on staff_profiles for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and is_admin = (select sp.is_admin from staff_profiles sp where sp.user_id = auth.uid())
    and role = (select sp.role from staff_profiles sp where sp.user_id = auth.uid())
    and is_active = (select sp.is_active from staff_profiles sp where sp.user_id = auth.uid())
  );
create policy "admin manage staff_profiles" on staff_profiles for all to authenticated
  using (is_staff_admin()) with check (is_staff_admin());
create policy "staff manage customers" on customers for all to authenticated using (true) with check (true);

-- Staff manage content
create policy "staff manage lodge_enquiries" on lodge_enquiries for all to authenticated using (is_staff_admin());
create policy "staff manage gym_enquiries" on gym_enquiries for all to authenticated using (is_staff_admin());
create policy "staff manage activity_enquiries" on activity_enquiries for all to authenticated using (is_staff_admin());
create policy "staff manage event_enquiries" on event_enquiries for all to authenticated using (is_staff_admin());
create policy "staff manage gallery_items" on gallery_items for all to authenticated using (is_staff_admin());
create policy "staff manage guest_reviews" on guest_reviews for all to authenticated using (is_staff_admin());
create policy "staff manage documents" on documents for all to authenticated using (is_staff_admin());
create policy "staff manage document_line_items" on document_line_items for all to authenticated using (is_staff_admin());
create policy "staff manage payment_settings" on payment_settings for all to authenticated using (is_staff_admin());
create policy "staff manage payment_submissions" on payment_submissions for all to authenticated using (is_staff_admin());
create policy "staff manage payment_audit_log" on payment_audit_log for all to authenticated using (is_staff_admin());
create policy "staff manage room_blocks" on room_blocks for all to authenticated using (is_staff_admin());
create policy "staff manage website_rooms" on website_rooms for all to authenticated using (is_staff_admin());
create policy "staff manage menu_categories" on menu_categories for all to authenticated using (is_staff_admin());
create policy "staff manage menu_items" on menu_items for all to authenticated using (is_staff_admin());
create policy "staff manage website_activities" on website_activities for all to authenticated using (is_staff_admin());

-- ===== Functions =====

-- Room hold for enquiry form
create or replace function hold_room_for_enquiry(p_block_id text, p_enquiry_id uuid, p_hold_minutes integer default 30)
returns text
language plpgsql security definer set search_path = public as $$
declare v_room_id text;
begin
  update website_rooms set status = 'available', hold_expires_at = null, held_by_enquiry_id = null
  where block_id = p_block_id and status = 'held' and hold_expires_at < now();

  select id into v_room_id from website_rooms
  where block_id = p_block_id and status = 'available'
  order by number limit 1 for update skip locked;

  if v_room_id is null then return null; end if;

  update website_rooms
  set status = 'held', hold_expires_at = now() + (p_hold_minutes || ' minutes')::interval, held_by_enquiry_id = p_enquiry_id
  where id = v_room_id;

  update lodge_enquiries set room_id = v_room_id where id = p_enquiry_id;
  return v_room_id;
end;
$$;

-- Confirm room booking (with optional hourly duration)
create or replace function confirm_room_booking(p_room_id text, p_hours integer default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_hours integer;
begin
  if p_hours is not null then v_hours := p_hours;
  else
    select rb.stay_duration_hours into v_hours
    from website_rooms r join room_blocks rb on rb.id = r.block_id
    where r.id = p_room_id;
  end if;

  update website_rooms
  set status = 'booked', hold_expires_at = null, held_by_enquiry_id = null,
      booked_until = now() + (coalesce(v_hours, 2) || ' hours')::interval
  where id = p_room_id;
end;
$$;

create or replace function release_room_hold(p_room_id text) returns void
language sql security definer set search_path = public as $$
  update website_rooms set status = 'available', hold_expires_at = null, held_by_enquiry_id = null
  where id = p_room_id and status = 'held';
$$;

create or replace function release_expired_holds() returns void
language sql security definer set search_path = public as $$
  update website_rooms set status = 'available', hold_expires_at = null, held_by_enquiry_id = null
  where status = 'held' and hold_expires_at < now();
$$;

create or replace function check_out_room(p_room_id text) returns void
language sql security definer set search_path = public as $$
  update website_rooms set status = 'available', booked_until = null
  where id = p_room_id and status = 'booked';
$$;

create or replace function release_expired_bookings() returns void
language sql security definer set search_path = public as $$
  update website_rooms set status = 'available', booked_until = null
  where status = 'booked' and booked_until < now();
$$;

-- Atomic document numbering
create or replace function next_document_number(p_document_type text) returns integer
language sql security definer set search_path = public as $$
  insert into document_counters (document_type, next_number)
  values (p_document_type, 2)
  on conflict (document_type) do update set next_number = document_counters.next_number + 1
  returning next_number - 1;
$$;

-- Payment verification trigger (admin-only)
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

create trigger payment_verification_admin_only
before update on payment_submissions
for each row execute function enforce_payment_verification_admin_only();

-- ===== EXECUTE Grants (tighten to staff-only) =====

revoke execute on function check_out_room(text) from public;
revoke execute on function confirm_room_booking(text, integer) from public;
revoke execute on function enforce_payment_verification_admin_only() from public;
revoke execute on function is_staff_admin() from public;
revoke execute on function next_document_number(text) from public;
revoke execute on function release_expired_bookings() from public;
revoke execute on function release_expired_holds() from public;
revoke execute on function release_room_hold(text) from public;

grant execute on function check_out_room(text) to authenticated;
grant execute on function confirm_room_booking(text, integer) to authenticated;
grant execute on function is_staff_admin() to authenticated;
grant execute on function next_document_number(text) to authenticated;
grant execute on function release_expired_bookings() to authenticated;
grant execute on function release_expired_holds() to authenticated;
grant execute on function release_room_hold(text) to authenticated;
-- hold_room_for_enquiry stays callable by anon (public enquiry form)

-- ===== Storage Bucket =====

insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;
