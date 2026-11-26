import { NextResponse } from "next/server";

/**
 * Consistently resolves the application's base URL (origin) across different environments.
 * Handles self-hosting scenarios behind proxies by checking forwarded headers and environment variables.
 * 
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (Canonical URL)
 * 2. NEXT_PUBLIC_BASE_URL (Fallback)
 * 3. x-forwarded-host / x-forwarded-proto (Proxy headers)
 * 4. request.url origin (Direct access fallback)
 */
export function resolveAppOrigin(request: Request): string {
  // 1. Check explicit environment variables first
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/$/, "");
  }

  const url = new URL(request.url);

  // 2. Check for proxy-forwarded headers
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? (url.protocol.replace(":", ""));
  
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, "");
  }

  // 3. Fallback to the request's own origin
  return url.origin.replace(/\/$/, "");
}

/**
 * Helper to construct an absolute redirect URL for standard admin login.
 */
export function getLoginRedirect(request: Request, reason?: string): URL {
  const origin = resolveAppOrigin(request);
  const loginUrl = new URL("/admin/login", origin);
  if (reason) {
    loginUrl.searchParams.set("reason", reason);
  }
  return loginUrl;
}
