-- PENDING - run this in the Supabase SQL editor. Claude Code's auto-mode
-- classifier blocked this too (grant/revoke changes are treated as
-- security-sensitive regardless of direction).
--
-- Why the PREVIOUS version of this file didn't work (user ran it, verified
-- the security advisor afterward, found nothing had changed): PostgreSQL
-- grants EXECUTE to the PUBLIC pseudo-role by default when a function is
-- created, and every real role (anon, authenticated, service_role, ...) is
-- always implicitly a member of PUBLIC - that membership can't be revoked.
-- Revoking EXECUTE from "anon" or "authenticated" directly does nothing if
-- the function is still executable via the PUBLIC grant underneath. This
-- version revokes from PUBLIC explicitly, which is the actual fix.
--
-- Why this matters: only hold_room_for_enquiry is meant to be callable by
-- anonymous visitors (the public, unauthenticated enquiry form needs it) -
-- everything else here is a staff/system-only operation (checking a room
-- out, confirming a paid booking, issuing a document number, etc.) and
-- should require a signed-in staff session.
--
-- Safe to run once. All statements are idempotent (revoke/grant on an
-- already-correct state is a no-op).

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

-- Verify after running - this should return ZERO rows:
-- select p.proname
-- from pg_proc p
-- join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname = 'public'
--   and p.proname in ('check_out_room','confirm_room_booking','is_staff_admin',
--                      'next_document_number','release_expired_bookings',
--                      'release_expired_holds','release_room_hold')
--   and has_function_privilege('anon', p.oid, 'EXECUTE');
