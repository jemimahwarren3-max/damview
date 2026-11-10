import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Service-role Supabase client — bypasses RLS entirely. Only ever used from
 * Route Handlers (app/api/**) to act on behalf of unauthenticated customers
 * (who have no Supabase session) under our own application-level checks:
 * payment reference must match, status must allow the action, deadline must
 * not have passed. Never import this from a Client Component or anywhere
 * that could ship SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
