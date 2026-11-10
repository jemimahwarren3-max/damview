-- Damview Resort — identity & access-control hardening
--
-- APPLIED 2026-11-10 by the user via the Supabase SQL editor (Claude Code's
-- auto-mode classifier kept blocking apply_migration for this one). Kept
-- here as a record of what's live - don't run it again, it's all
-- idempotent (if/create-if-not-exists) but there's nothing left to do.
--
-- HOW TO RUN THIS (historical - already done):
-- 1. Go to your Supabase project dashboard -> SQL Editor -> New query.
-- 2. Paste this entire file.
-- 3. Click Run.
-- 4. Tell Claude it's done so it can verify and update the codebase to match
--    (it adds columns/tables the app will start using once this exists).
--
-- What this does:
--   - Adds a lightweight `customers` table so repeat guests' enquiries can be
--     linked by phone number, without requiring an account.
--   - Adds `access_token_hash` to payment_submissions, for a future upgrade
--     to hashed, revocable payment links (not yet used by the app - this
--     just adds the column so it's ready).
--   - Adds `is_admin` to staff_profiles, and real enforcement so that only
--     an admin can verify/reject a payment - checked by the database itself
--     via a trigger, not just hidden in the admin UI.
--   - Fixes a real privilege-escalation hole: right now, ANY signed-in staff
--     member can do anything to staff_profiles, including granting
--     themselves admin. This replaces that with: everyone can read the
--     staff list; a non-admin can only edit their own name/department (not
--     their own is_admin/role); only an existing admin can change anyone's
--     is_admin/role or manage other staff. The very first profile created
--     (when the table is empty) is allowed to self-grant admin, so there's
--     a way to bootstrap the first account.
--
-- Safe to run: nothing here deletes or overwrites existing data.

-- ===== Lightweight customer records (dedup by phone, no accounts) =====
create table if not exists customers (
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

alter table lodge_enquiries add column if not exists customer_id uuid references customers(id);
alter table event_enquiries add column if not exists customer_id uuid references customers(id);
alter table activity_enquiries add column if not exists customer_id uuid references customers(id);
alter table gym_enquiries add column if not exists customer_id uuid references customers(id);
alter table payment_submissions add column if not exists customer_id uuid references customers(id);

alter table customers enable row level security;

do $$ begin
  create policy "public insert customers" on customers for insert to public with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read customers" on customers for select to public using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "staff manage customers" on customers for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- ===== Hardened payment access token column (not wired up by the app yet) =====
alter table payment_submissions add column if not exists access_token_hash text;

-- ===== Two-tier staff access: is_admin, enforced server-side =====
alter table staff_profiles add column if not exists is_admin boolean not null default false;

create or replace function is_staff_admin() returns boolean
language sql security definer stable
set search_path = public
as $$
  select coalesce((select is_admin from staff_profiles where user_id = auth.uid()), false);
$$;

drop policy if exists "staff manage staff_profiles" on staff_profiles;

do $$ begin
  create policy "staff read staff_profiles" on staff_profiles for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "self insert staff_profiles" on staff_profiles for insert to authenticated
  with check (
    user_id = auth.uid()
    and (is_admin = false or not exists (select 1 from staff_profiles))
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "self update own staff_profile" on staff_profiles for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and is_admin = (select sp.is_admin from staff_profiles sp where sp.user_id = auth.uid())
    and role = (select sp.role from staff_profiles sp where sp.user_id = auth.uid())
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin manage staff_profiles" on staff_profiles for all to authenticated
  using (is_staff_admin())
  with check (is_staff_admin());
exception when duplicate_object then null; end $$;

-- Only an admin can move a payment into VERIFIED/REJECTED, enforced at the
-- database level regardless of what the client UI allows.
create or replace function enforce_payment_verification_admin_only() returns trigger
language plpgsql security definer
as $$
begin
  if new.payment_status in ('VERIFIED', 'REJECTED') and old.payment_status is distinct from new.payment_status then
    if not is_staff_admin() then
      raise exception 'Only admin staff can verify or reject a payment';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists payment_verification_admin_only on payment_submissions;
create trigger payment_verification_admin_only
before update on payment_submissions
for each row execute function enforce_payment_verification_admin_only();
