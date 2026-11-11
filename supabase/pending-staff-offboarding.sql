-- PENDING - run this in the Supabase SQL editor. Claude Code's auto-mode
-- classifier blocks this one too (adding a column + changing a function/
-- policy is treated as schema-sensitive).
--
-- Adds a way to offboard staff without deleting their account or their
-- history (approvals, who checked a room out, etc. all reference user_id).
-- Deactivating just flips is_active to false:
--   - is_staff_admin() now also requires is_active, so a deactivated admin
--     immediately loses every admin-only RPC (confirm_room_booking,
--     check_out_room, etc.) the moment they're switched off.
--   - the admin app's own gate (AdminShell) checks is_active and locks the
--     whole /admin area for that account, not just the admin-only actions.
--   - the "self update own profile" policy is extended so a deactivated
--     person can't just flip themselves back on - same pattern already
--     used there for is_admin and role.
--
-- Safe to run once.

alter table staff_profiles add column if not exists is_active boolean not null default true;

create or replace function is_staff_admin()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce((select is_admin and is_active from staff_profiles where user_id = auth.uid()), false);
$$;

drop policy if exists "self update own staff_profile" on staff_profiles;
create policy "self update own staff_profile" on staff_profiles
for update
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and is_admin = (select sp.is_admin from staff_profiles sp where sp.user_id = auth.uid())
  and role = (select sp.role from staff_profiles sp where sp.user_id = auth.uid())
  and is_active = (select sp.is_active from staff_profiles sp where sp.user_id = auth.uid())
);
