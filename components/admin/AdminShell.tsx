"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium",
              active ? "bg-dv-forest text-dv-ivory" : "text-dv-black hover:bg-dv-cream"
            )}
          >
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-dv-cream">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-border bg-background p-5 lg:flex">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Image src="/images/brand/logo.png" alt="Damview Resort" width={140} height={47} className="h-9 w-auto" />
        </Link>
        <NavList />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex size-10 items-center justify-center text-dv-forest lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="font-serif text-lg text-dv-forest">{title}</h1>
          <button
            type="button"
            onClick={signOut}
            className="hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-dv-forest sm:flex"
          >
            <LogOut size={15} /> Sign out
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-dv-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative flex w-72 flex-col gap-6 bg-background p-5">
            <div className="flex items-center justify-between">
              <Image src="/images/brand/logo.png" alt="Damview Resort" width={140} height={47} className="h-9 w-auto" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex size-9 items-center justify-center text-dv-forest"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>
            <NavList onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
