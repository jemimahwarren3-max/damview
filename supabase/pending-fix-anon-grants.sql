-- PENDING - run this in the Supabase SQL editor. Claude Code's auto-mode
-- classifier blocked this too (grant/revoke changes are treated as
-- security-sensitive regardless of direction).
--
-- Why this matters: the earlier checkout-and-hardening migration was
-- supposed to leave only hold_room_for_enquiry callable by anonymous users
-- (it's the one function the public, unauthenticated enquiry forms need) and
-- make everything else staff-only. Checking the live security advisor after
-- that migration ran shows it didn't take effect - every one of these
-- functions is still anon-executable:
--   check_out_room, confirm_room_booking, enforce_payment_verification_admin_only,
--   is_staff_admin, next_document_number, release_expired_bookings,
--   release_expired_holds, release_room_hold
--
-- None of these should be callable by a random visitor with just the public
-- anon key - they're all staff/system-only operations (checking a room out,
-- confirming a paid booking, issuing a document number, etc.). This
-- re-asserts the intended grants explicitly.
--
-- Safe to run once. All statements are idempotent (revoke/grant on an
-- already-correct state is a no-op).

revoke execute on function check_out_room(text) from anon;
revoke execute on function confirm_room_booking(text, integer) from anon;
revoke execute on function enforce_payment_verification_admin_only() from anon, authenticated;
revoke execute on function is_staff_admin() from anon;
revoke execute on function next_document_number(text) from anon;
revoke execute on function release_expired_bookings() from anon;
revoke execute on function release_expired_holds() from anon;
revoke execute on function release_room_hold(text) from anon;

grant execute on function check_out_room(text) to authenticated;
grant execute on function confirm_room_booking(text, integer) to authenticated;
grant execute on function is_staff_admin() to authenticated;
grant execute on function next_document_number(text) to authenticated;
grant execute on function release_expired_bookings() to authenticated;
grant execute on function release_expired_holds() to authenticated;
grant execute on function release_room_hold(text) to authenticated;
