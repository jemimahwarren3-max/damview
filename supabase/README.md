# Supabase setup

**Status: live.** Project `jbmakvbmyddvlgfjonmc` is connected, `schema.sql` is
applied with RLS policies on every table, and `lib/data/*.ts` reads/writes
real data (falling back to static sample data only when Supabase env vars
aren't set, e.g. a fresh deploy). Staff login (`/admin`) is wired to Supabase
Auth. A public `media` storage bucket holds guest review photos
(`reviews/`) and admin-uploaded gallery photos (`gallery/`).

**Still needed from you:** create the first staff account in the Supabase
dashboard (Authentication → Users → Add user) — nobody can sign in to
`/admin` until one exists. Let the assistant know the name/role once you've
made one, so a matching `staff_profiles` row can be added.

Regenerate `types/supabase.ts` (via the `generate_typescript_types` MCP tool)
after any schema change, and keep `schema.sql` here in sync with what's
actually applied — it's the readable reference copy, not the source of
truth (the live database is).
