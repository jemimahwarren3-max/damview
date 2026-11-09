import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-dv-forest px-4 py-12">
      <Image src="/images/brand/logo.png" alt="Damview Resort" width={220} height={73} className="h-14 w-auto" />

      <div className="w-full max-w-sm rounded-2xl bg-dv-ivory p-8">
        <h1 className="font-serif text-2xl text-dv-forest">Staff Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Staff accounts and sign-in are not wired up yet. This screen is a preview of the layout for
          Stage 10, when the backend is built.
        </p>

        <div className="mt-6 flex flex-col gap-4 opacity-60">
          <div>
            <label className="text-sm font-medium text-dv-black">Phone or email</label>
            <input disabled className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5" />
          </div>
          <div>
            <label className="text-sm font-medium text-dv-black">Password</label>
            <input disabled type="password" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5" />
          </div>
        </div>

        <Link
          href="/admin/dashboard"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dv-forest px-6 py-3 text-sm font-bold text-dv-ivory hover:bg-dv-leaf"
        >
          Preview dashboard <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
