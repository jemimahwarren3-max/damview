import type { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type SupabaseClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;

/** Whether the currently signed-in staff member is an admin. Null if signed out. */
export async function getIsAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;
  const { data: profile } = await supabase.from("staff_profiles").select("is_admin").eq("user_id", userData.user.id).maybeSingle();
  if (!profile?.is_admin) return false;

  // is_active is a newer column that may not be live yet - fetched separately
  // so a missing column can never break admin access before the migration runs.
  const { data: activeRow } = await supabase.from("staff_profiles").select("is_active").eq("user_id", userData.user.id).maybeSingle();
  return activeRow?.is_active ?? true;
}
