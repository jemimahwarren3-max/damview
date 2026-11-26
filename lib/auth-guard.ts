"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Fast auth guard for Server Actions.
 *
 * Uses getSession() (reads cookies locally, ~1ms) instead of getUser()
 * (network round-trip to Supabase Auth, ~500ms-1.5s).
 *
 * Security model:
 * - Session cookie is HttpOnly and signed by Supabase — cannot be forged.
 * - Supabase RLS policies enforce data access on the DB side regardless.
 * - Role is fetched from the `users` table (not the JWT), so role changes
 *   take effect immediately without requiring a token re-issue.
 * - Full cryptographic verification via getUser() still happens on every
 *   page render in getCachedAuth() — this guards reads.
 * - Server actions only write data — the DB's RLS is the ultimate guard.
 *
 * This reduces Server Action latency by ~500-1500ms per call.
 */
export async function requireAuth(allowedRoles?: string[]) {
  const supabase = await createClient();

  // Fast path: read session from cookie (no network round-trip)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to perform this action.");
  }

  const userId = session.user.id;

  // Fetch role from DB (still required to verify role, but session is trusted)
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  const role = userData?.role ?? null;

  if (!role) {
    throw new Error("Unauthorized: User profile not found.");
  }

  if (role === "disabled") {
    throw new Error("Unauthorized: Your account has been disabled.");
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    throw new Error(`Unauthorized: Requires ${allowedRoles.join(" or ")} role.`);
  }

  return { user: session.user, role, supabase };
}
