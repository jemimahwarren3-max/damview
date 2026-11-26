"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY ?? "";

// Simple in-memory rate limiter for login attempts
const loginAttempts = new Map<
  string,
  { count: number; firstAttempt: number }
>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

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

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);

  if (!attempts || now - attempts.firstAttempt > WINDOW_MS) {
    loginAttempts.set(identifier, { count: 1, firstAttempt: now });
    return true;
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    return false;
  }

  attempts.count += 1;
  return true;
}

function cleanupRateLimiter() {
  const now = Date.now();
  for (const [key, val] of loginAttempts.entries()) {
    if (now - val.firstAttempt > WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }
}

async function verifyTurnstile(token: string): Promise<boolean> {
  // Skip in dev or if no secret configured
  if (process.env.NODE_ENV === "development") return true;
  if (!TURNSTILE_SECRET || TURNSTILE_SECRET === "dev") return true;
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v1/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET,
          response: token,
        }).toString(),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      if (process.env.NODE_ENV !== "production") {
        console.error(`[Turnstile] HTTP ${res.status}: ${text}`);
      }
      // Allow login if Turnstile service itself is erroring
      return true;
    }
    const data = await res.json();
    if (!data.success) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[Turnstile] Verification failed:", data["error-codes"]);
      }
    }
    return data.success === true;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Turnstile] Fetch error:", err);
    }
    // Don't block login if Turnstile is unreachable
    return true;
  }
}

export const signIn = async (
  email: string,
  password?: string,
  cfToken?: string,
): Promise<{ error: string | null; role?: string }> => {
  try {
    const supabase = await createClient();

    if (!password) {
      return { error: "Password is required" };
    }

    // Rate limiting by email
    cleanupRateLimiter();
    const rateLimitKey = email.trim().toLowerCase();
    if (!checkRateLimit(rateLimitKey)) {
      return {
        error:
          "Too many login attempts. Please wait 15 minutes before trying again.",
      };
    }

    // Verify Turnstile CAPTCHA
    if (!cfToken || !(await verifyTurnstile(cfToken))) {
      return {
        error: "CAPTCHA verification failed. Please try again.",
      };
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    let signInData:
      | {
          user?: { id: string } | null;
          session?: { user?: { id: string } | null } | null;
        }
      | null = null;
    let signInError: { message?: string } | null = null;

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      signInData = data;
      signInError = error;

      if (!error) break;
      if (attempt < 2 && isRetryableAuthError(error)) {
        await sleep(250 * attempt);
        continue;
      }
      break;
    }

    if (signInError) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Login Server Side Error:", signInError);
      }

      const signInErrorMessage = signInError.message ?? "Login failed";

      if (/Unexpected token\s*</i.test(signInErrorMessage) || /not valid JSON/i.test(signInErrorMessage)) {
        return {
          error:
            "Supabase response was HTML instead of JSON. Verify NEXT_PUBLIC_SUPABASE_URL points to your Supabase API gateway and that /auth/v1 and /rest/v1 are routed to Supabase (not your Next.js app).",
        };
      }

      if (isRetryableAuthError(signInError)) {
        return {
          error:
            "Authentication service is temporarily busy. Please retry in a few seconds.",
        };
      }
      return { error: signInErrorMessage };
    }

    // Reuse the user returned by signInWithPassword to avoid an extra /user call.
    const user = signInData?.user ?? signInData?.session?.user ?? null;
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "disabled") {
        await supabase.auth.signOut();
        return {
          error:
            "Your account has been disabled. Please contact the administrator.",
        };
      }

      return { error: null, role: profile?.role ?? undefined };
    }

    return { error: null };
  } catch (err) {
    const errorMessage =
      err instanceof Error && err.message
        ? err.message
        : "An unexpected error occurred. Please try again.";

    console.error("Unexpected sign-in error:", err);

    // Return a safe but actionable message for infrastructure/config issues.
    if (/Missing Supabase env vars/i.test(errorMessage)) {
      return { error: errorMessage };
    }

    if (/fetch failed|network|ECONNREFUSED|ENOTFOUND|certificate|TLS/i.test(errorMessage)) {
      return {
        error:
          "Cannot reach Supabase Auth from server. Check NEXT_PUBLIC_SUPABASE_URL, reverse proxy, and TLS/certificate settings.",
      };
    }

    if (/Unexpected token\s*</i.test(errorMessage) || /not valid JSON/i.test(errorMessage)) {
      return {
        error:
          "Supabase response was HTML instead of JSON. Verify NEXT_PUBLIC_SUPABASE_URL points to your Supabase API gateway and that /auth/v1 and /rest/v1 are routed to Supabase (not your Next.js app).",
      };
    }

    return { error: "An unexpected auth error occurred. Please try again." };
  }
};
