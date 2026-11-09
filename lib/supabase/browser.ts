import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

/**
 * Browser-side Supabase client for Auth (sign in/out from client components).
 * Returns null when env vars aren't set, same fallback convention as
 * lib/supabase/client.ts.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createBrowserClient<Database>(url, anonKey);
}
