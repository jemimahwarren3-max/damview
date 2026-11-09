# Supabase setup (Stage 10 — not yet applied)

This schema isn't live anywhere. Steps for when the Supabase project exists:

1. Create the project at supabase.com (free tier is fine at this scale).
2. Paste `schema.sql` into the Supabase SQL editor and run it.
3. **Enable Row Level Security (RLS) on every table before going live.** Supabase
   tables are reachable over its public API by default — without RLS policies,
   anyone with the anon key could read or write any row. At minimum: public
   `select` on content tables (menu_items, activities, gallery_items,
   approved guest_reviews), but enquiry/document tables should only be
   writable by anyone (`insert`) and only readable by authenticated staff.
4. Give me the project URL and anon key (safe to share — it's public by
   design) plus the service role key (not safe to share in chat — set it as
   an environment variable directly, never paste it here).
5. From there: swap `lib/data/*.ts` mock arrays for real Supabase queries,
   wire the admin login screen to Supabase Auth, and connect the disabled
   "Upload photo" button in `/admin/gallery` to Supabase Storage.

Nothing in the app reads from this schema yet — `lib/data/*.ts` is still the
only data source.
