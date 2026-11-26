import { cache } from "react";
import { createClient } from "./server";

const AUTH_RETRYABLE_ERROR = /(timeout|timed out|deadline exceeded|gateway|temporar|unavailable|database error querying schema)/i;

function isRetryableAuthError(error: unknown): boolean {
  if (!error) return false;
  const msg =
    typeof error === "string"
      ? error
      : typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : "";
  return AUTH_RETRYABLE_ERROR.test(msg);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Request-scoped cached auth helper.
 * React's `cache()` deduplicates calls within the same server request,
 * so auth + role lookup happens at most ONCE per request instead of
 * being duplicated across layout → server actions.
 *
 * NOTE: The module-level roleCache Map was removed because Vercel serverless
 * functions don't share module state across invocations (cold starts reset it),
 * making it ineffective and a potential source of stale data.
 */
export const getCachedAuth = cache(async () => {
  const supabase = await createClient();

  // Use getUser() for cryptographic JWT verification.
  // getSession() only reads cookies without validating the token — not safe
  // for production auth checks. getUser() makes a server round-trip to
  // Supabase Auth to verify the token is genuine and not expired.
  // The middleware already refreshes sessions, so this is always fast.
  let authUser: { id: string; email?: string | null } | null = null;
  let authError: unknown = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error) {
      authUser = user;
      authError = null;
      break;
    }

    authError = error;
    if (attempt < 2 && isRetryableAuthError(error)) {
      await sleep(200 * attempt);
      continue;
    }
    break;
  }

  if (!authUser && authError && isRetryableAuthError(authError)) {
    // Temporary Auth API outage fallback: use cookie session to avoid hard fail.
    // Middleware still keeps cookies in sync; once Auth recovers, getUser() resumes.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    authUser = session?.user
      ? { id: session.user.id, email: session.user.email ?? null }
      : null;
  }

  const user: { id: string; email?: string } | null = authUser
    ? { id: authUser.id, email: authUser.email ?? undefined }
    : null;

  if (!user) {
    return { user: null, role: null, supabase };
  }

  // Fetch role from user profile (deduplicated per request by React cache()).
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    user,
    role: userData?.role ?? null,
    supabase,
  };
});
