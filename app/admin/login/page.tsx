"use client";

import { Suspense, useState, useRef, useMemo } from "react";
import { signIn } from "@/lib/actions/auth";
import { Eye, EyeOff, LogIn, LayoutDashboard } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useSearchParams } from "next/navigation";

const isDev = process.env.NODE_ENV === "development";
const siteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

function InactivityBanner({
  hasBlockingMessage,
}: {
  hasBlockingMessage: boolean;
}) {
  const searchParams = useSearchParams();
  const logoutReason = searchParams.get("reason");
  const showInactivityMessage = logoutReason === "inactivity";

  if (!showInactivityMessage || hasBlockingMessage) return null;

  return (
    <div className="text-center text-sm rounded-lg p-3 text-amber-700 bg-amber-50 border border-amber-200">
      You were logged out due to inactivity. Please sign in again.
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaReady, setCaptchaReady] = useState(isDev);
  const cfTokenRef = useRef<string | null>(isDev ? "dev-bypass" : null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  // Stable reference so Turnstile doesn't reset on parent re-renders
  const turnstileOptions = useMemo(
    () => ({ theme: "light" as const, size: "normal" as const }),
    [],
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Capture token from ref before any state changes trigger re-renders
    const token = cfTokenRef.current;
    if (!token) {
      setMessage("Error: Please complete the CAPTCHA challenge.");
      return;
    }
    setLoading(true);
    setMessage("");
    const { error, role } = await signIn(email, password, token);
    if (error) {
      setMessage(`Error: ${error}`);
      // Reset Turnstile so user can retry
      turnstileRef.current?.reset();
      cfTokenRef.current = null;
      setCaptchaReady(false);
      setLoading(false);
      return;
    }

    // Redirect based on role returned by the server action (no extra round-trips)
    if (role === "superadmin") {
      window.location.href = "/superadmin/dashboard";
    } else if (role === "kitchen") {
      window.location.href = "/admin/orders";
    } else {
      window.location.href = "/admin/dashboard";
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden bg-neutral-50">
      {/* Thin fading grid backdrop */}
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <span className="bg-neutral-900 rounded-lg p-2.5 text-white">
            <LayoutDashboard className="h-6 w-6" />
          </span>
          <h1 className="font-display text-2xl font-semibold text-neutral-900 tracking-tight">
            Damview Resort
          </h1>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm space-y-6">
          <div className="text-center">
            <h2 className="font-display text-xl font-semibold text-neutral-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Sign in to manage your hotel
            </p>
          </div>

          <Suspense fallback={null}>
            <InactivityBanner hasBlockingMessage={!!message} />
          </Suspense>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="premium-input"
                placeholder="admin@hotel.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="premium-input pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-center py-1">
              <Turnstile
                ref={turnstileRef}
                siteKey={siteKey}
                onSuccess={(token) => {
                  cfTokenRef.current = token;
                  setCaptchaReady(true);
                }}
                onExpire={() => {
                  cfTokenRef.current = null;
                  setCaptchaReady(false);
                  turnstileRef.current?.reset();
                }}
                onError={() => {
                  cfTokenRef.current = null;
                  setCaptchaReady(false);
                  setMessage("Error: CAPTCHA failed to load. Please refresh.");
                }}
                options={turnstileOptions}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !captchaReady}
              className="btn-primary w-full h-11"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Sign in
                </>
              )}
            </button>

            {message && (
              <div
                className={`text-center text-sm rounded-lg p-3 ${
                  message.startsWith("Error")
                    ? "text-red-700 bg-red-50 border border-red-200"
                    : "text-green-700 bg-green-50 border border-green-200"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          Secure Hotel Management System
        </p>
      </div>
    </div>
  );
}
