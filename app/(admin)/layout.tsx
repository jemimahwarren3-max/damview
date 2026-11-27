import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import AutoLogout from "@/components/dashboard/AutoLogout";
import OfflineIndicator from "@/components/admin/OfflineIndicator";
import RegisterSW from "@/components/admin/RegisterSW";
import { getCachedAuth } from "@/lib/supabase/cached-auth";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import "@/app/hospiq-globals.css";

export const instant = false;

export const metadata: Metadata = {
  title: { default: "Damview Resort", template: "%s — Damview Resort" },
  manifest: "/admin-manifest.json",
  other: { "mobile-web-app-capable": "yes", "apple-mobile-web-app-capable": "yes" },
};

const roleLabels: Record<string, string> = {
  superadmin: "Admin",
  admin: "Manager 1",
  manager: "Manager 2",
  kitchen: "Kitchen",
  cashier: "Cashier",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: any;
  let profile: { role: "admin" | "superadmin" | "manager" | "kitchen" | "cashier" } = { role: "admin" };

  try {
    const { user: authUser, role } = await getCachedAuth();

    if (!authUser) {
      redirect("/admin/login");
    }

    user = authUser;
    profile = { role: role as "admin" | "superadmin" | "manager" | "kitchen" | "cashier" };

    if (!role || role === "disabled") {
      redirect("/admin/login");
    }
  } catch (err: any) {
    // Re-throw Next.js redirect errors (they use a special NEXT_REDIRECT digest)
    // Also re-throw DYNAMIC_SERVER_USAGE so Next.js can opt into dynamic rendering
    if (err?.digest?.startsWith("NEXT_REDIRECT") || err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    // For any other error, redirect to login
    console.error("Admin layout error:", err);
    redirect("/admin/login");
  }

  return (
    <ConfirmProvider>
      <div className="flex min-h-screen bg-white">
        <Sidebar role={profile.role} />
        <AutoLogout />
        <RegisterSW />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <OfflineIndicator />
          {/* Header */}
          <header className="flex items-center justify-between px-6 lg:px-8 py-3.5 border-b border-neutral-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
            <div>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                {roleLabels[profile.role] || profile.role}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-semibold">
                  {user?.email?.charAt(0)?.toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-neutral-900">
                    {user?.email}
                  </p>
                  <p className="text-xs text-neutral-500 capitalize">
                    {roleLabels[profile.role] || profile.role}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto dotted-bg p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ConfirmProvider>
  );
}
