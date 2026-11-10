import "server-only";
import { Resend } from "resend";

/**
 * Server-only. Returns null when RESEND_API_KEY isn't set, so callers can
 * skip emailing gracefully instead of failing the whole action - matches
 * the rest of the app's fallback pattern for optional integrations.
 */
export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

/** "from" address for outgoing mail - must be on a domain verified with Resend. */
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL ?? "Damview Resort <onboarding@resend.dev>";
