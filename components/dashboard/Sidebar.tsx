"use client";

import {
  LayoutDashboard,
  BedDouble,
  QrCode,
  Users,
  Utensils,
  ClipboardList,
  Receipt,
  History,
  LogOut,
  ShieldCheck,
  Settings,
  FileBarChart,
  Armchair,
  CalendarCheck,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";

function SidebarComponent({
  role,
}: {
  role: "admin" | "superadmin" | "manager" | "kitchen" | "cashier";
}) {
  const pathname = usePathname();
  const adminLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Reservations", href: "/admin/reservations", icon: CalendarCheck },
    { name: "Rooms", href: "/admin/rooms", icon: BedDouble },
    { name: "Guests", href: "/admin/guests", icon: Users },
    { name: "Menu", href: "/admin/menu", icon: Utensils },
    { name: "Orders (KOT)", href: "/admin/orders", icon: ClipboardList },
    { name: "Billing", href: "/admin/billing", icon: Receipt },
    { name: "History", href: "/admin/history", icon: History },
  ];

  const superadminLinks = [
    { name: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
    { name: "Staff", href: "/superadmin/admins", icon: ShieldCheck },
    { name: "Reservations", href: "/admin/reservations", icon: CalendarCheck },
    { name: "Rooms", href: "/superadmin/rooms", icon: BedDouble },
    { name: "Guests", href: "/superadmin/guests", icon: Users },
    { name: "Menu", href: "/superadmin/menu", icon: Utensils },
    { name: "Orders", href: "/superadmin/orders", icon: ClipboardList },
    { name: "Billing", href: "/superadmin/billing", icon: Receipt },
    { name: "Reports", href: "/superadmin/reports", icon: FileBarChart },
    { name: "History", href: "/superadmin/history", icon: History },
    { name: "Settings", href: "/superadmin/settings", icon: Settings },
  ];

  const cashierLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Reservations", href: "/admin/reservations", icon: CalendarCheck },
    { name: "Rooms", href: "/admin/rooms", icon: BedDouble },
    { name: "Guests", href: "/admin/guests", icon: Users },
    { name: "Billing", href: "/admin/billing", icon: Receipt },
  ];

  const kitchenLinks = [
    { name: "Menu", href: "/admin/menu", icon: Utensils },
    { name: "Orders (KOT)", href: "/admin/orders", icon: ClipboardList },
  ];

  const links =
    role === "superadmin"
      ? superadminLinks
      : role === "kitchen"
        ? kitchenLinks
        : role === "cashier"
          ? cashierLinks
          : adminLinks;

  return (
    <div className="flex h-screen w-64 flex-col justify-between bg-neutral-50 border-r border-neutral-200 z-20 sticky top-0 sidebar-hw-accel">
      <div className="px-3 py-6 flex-1 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center mb-7 px-2 gap-2.5">
          <span className="bg-neutral-900 rounded-lg p-2 text-white flex-shrink-0">
            <LayoutDashboard className="h-4 w-4" />
          </span>
          <h2 className="font-display text-base font-semibold tracking-tight text-neutral-900 truncate">
            Damview Resort
          </h2>
        </div>

        {/* Role Badge */}
        <div className="mx-2 mb-5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            {role === "superadmin"
              ? "Admin Panel"
              : role === "manager"
                ? "Manager 2"
                : role === "kitchen"
                  ? "Kitchen"
                  : role === "cashier"
                    ? "Cashier"
                    : "Manager 1"}
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5">
          {links.map((link) => {
            const isQRPattern =
              pathname.startsWith("/admin/rooms/qr") ||
              pathname.startsWith("/superadmin/rooms/qr");
            const isActive = link.href.endsWith("/rooms")
              ? pathname === link.href ||
                (pathname.startsWith(link.href + "/") && !isQRPattern)
              : pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                  isActive
                    ? "bg-white text-neutral-900 border border-neutral-200 shadow-sm"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 border border-transparent"
                }`}
              >
                <link.icon
                  className={`h-[18px] w-[18px] flex-shrink-0 ${
                    isActive
                      ? "text-neutral-900"
                      : "text-neutral-400 group-hover:text-neutral-700"
                  }`}
                />
                <span className="truncate">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-200">
        <Link
          href="/auth/logout"
          prefetch={false}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </Link>
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const Sidebar = memo(SidebarComponent);
