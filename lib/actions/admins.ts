"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { bumpCacheVersions } from "@/lib/cache/redis";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey)
    throw new Error("Server misconfiguration: Missing service role key.");
  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function toggleAdminStatus(userId: string, currentRole: string) {
  const { supabase, user } = await requireAuth(["superadmin"]);
  const supabaseAdmin = getSupabaseAdmin();

  if (user?.id === userId) return { error: "Cannot change your own role here." };

  if (currentRole === "disabled") {
    const { data: authUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (fetchError) return { error: fetchError.message };

    const restoreRole = (authUser.user?.user_metadata?.previous_role as string) ?? "admin";
    await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: { previous_role: null } });

    const { error } = await supabase.from("users").update({ role: restoreRole as any }).eq("id", userId);
    if (error) return { error: error.message };
  } else {
    await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: { previous_role: currentRole } });
    const { error } = await supabase.from("users").update({ role: "disabled" as any }).eq("id", userId);
    if (error) return { error: error.message };
  }

  revalidatePath("/superadmin/admins");
  await bumpCacheVersions(["managers", "dashboard"]);
  return { success: true };
}

export async function deleteAdmin(userId: string) {
  const { user } = await requireAuth(["superadmin"]);
  if (user?.id === userId) return { error: "Cannot delete your own account." };

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/superadmin/admins");
  await bumpCacheVersions(["managers", "dashboard"]);
  return { success: true };
}

export async function resetAdminPassword(userId: string, newPassword: string) {
  await requireAuth(["superadmin"]);
  if (newPassword.length < 6) return { error: "Password must be at least 6 characters." };

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return { error: error.message };

  return { success: true };
}
