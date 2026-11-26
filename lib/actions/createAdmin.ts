"use server";

import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "@/lib/auth-guard";
import { bumpCacheVersions } from "@/lib/cache/redis";

export async function createAdminAccount(
  email: string,
  password?: string,
  role: "admin" | "manager" | "cashier" | "kitchen" = "admin",
) {
  // Only superadmin can create new admin accounts
  await requireAuth(["superadmin"]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      error:
        "Server misconfiguration: Missing service role key to create admins.",
    };
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Preserve single-account constraint for Manager 1 / Manager 2.
  // Kitchen can have multiple accounts.
  if (role === "admin" || role === "manager") {
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("role", role)
      .limit(1)
      .single();

    if (existingUser) {
      return {
        error: `An account for ${role === "manager" ? "Manager 2" : "Manager 1"} already exists. There can only be one.`,
      };
    }
  }

  if (!password) {
    return { error: "Password is required to create an admin account." };
  }

  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role },
  });

  if (createError) return { error: createError.message };
  await bumpCacheVersions(["managers", "dashboard"]);
  const roleLabel = { admin: "Manager 1", manager: "Manager 2", cashier: "Cashier", kitchen: "Kitchen" }[role];
  return { success: true, message: `${roleLabel} created successfully.` };
}
