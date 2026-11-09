import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Anon-key client — safe for Server Components and the browser. Only ever
 * reads/writes what RLS policies (supabase/schema.sql) allow for
 * unauthenticated users: public content reads, and inserting enquiries/
 * reviews. Never use the service role key here.
 *
 * Returns null when NEXT_PUBLIC_SUPABASE_URL/ANON_KEY aren't set (e.g. a
 * fresh deployment before Supabase env vars are added) — callers fall back
 * to the known static data in that case rather than failing the build.
 */
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient<Database>(url, anonKey);
}
