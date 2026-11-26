"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Staff login isn't connected yet. Check back once Supabase is configured.");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError("Incorrect email or password.");
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-dv-forest px-4 py-12">
      <Image src="/images/brand/logo.png" alt="Damview Resort" width={220} height={73} className="h-14 w-auto" />

      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-dv-ivory p-8">
        <h1 className="font-serif text-2xl text-dv-forest">Staff Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with your staff account to access the admin dashboard.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-dv-black">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-dv-black">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        {!configured && (
          <p className="mt-4 text-sm text-destructive">
            Staff login isn&apos;t connected yet. Check back once Supabase is configured.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dv-forest px-6 py-3 text-sm font-bold text-dv-ivory transition-colors hover:bg-dv-leaf disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
