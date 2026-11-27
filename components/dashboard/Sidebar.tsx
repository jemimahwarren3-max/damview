"use client";

import {
  LayoutDashboard,
  BedDouble,
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
  Landmark,
  BarChart3,
  PartyPopper,
  Images,
  CreditCard,
  FileText,
  Dumbbell,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

function SidebarComponent({
  role,
}: {
  role: "admin" | "superadmin" | "manager" | "kitchen" | "cashier";
}) {
  const pathname = usePathname();

  const adminSections: NavSection[] = [
    {
      items: [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "Front Desk",
      items: [
        { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
        { name: "Reservations", href: "/admin/reservations", icon: CalendarCheck },
        { name: "Rooms", href: "/admin/rooms", icon: BedDouble },
        { name: "Guests", href: "/admin/guests", icon: Users },
        { name: "Events", href: "/admin/events", icon: PartyPopper },
      ],
    },
    {
      label: "Restaurant",
      items: [
        { name: "Tables", href: "/admin/tables", icon: Armchair },
        { name: "Menu", href: "/admin/menu", icon: Utensils },
        { name: "Orders (KOT)", href: "/admin/orders", icon: ClipboardList },
      ],
    },
    {
      label: "Finance",
      items: [
        { name: "Billing", href: "/admin/billing", icon: Receipt },
        { name: "Payments", href: "/admin/payments", icon: CreditCard },
        { name: "Invoices", href: "/admin/invoices", icon: FileText },
        { name: "Cash Recon", href: "/admin/reconciliation", icon: Landmark },
      ],
    },
    {
      label: "Facilities",
      items: [
        { name: "Activities", href: "/admin/activities", icon: Dumbbell },
        { name: "Gym", href: "/admin/gym", icon: Dumbbell },
        { name: "Gallery", href: "/admin/gallery", icon: Images },
        { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
      ],
    },
    {
      label: "Reports",
      items: [
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { name: "History", href: "/admin/history", icon: History },
      ],
    },
    {
      items: [
        { name: "Staff", href: "/admin/staff", icon: ShieldCheck },
        { name: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const superadminSections: NavSection[] = [
    {
      items: [
        { name: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
        { name: "Staff", href: "/superadmin/admins", icon: ShieldCheck },
      ],
    },
    {
      label: "Front Desk",
      items: [
        { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
        { name: "Reservations", href: "/admin/reservations", icon: CalendarCheck },
        { name: "Rooms", href: "/superadmin/rooms", icon: BedDouble },
        { name: "Guests", href: "/superadmin/guests", icon: Users },
        { name: "Events", href: "/admin/events", icon: PartyPopper },
      ],
    },
    {
      label: "Restaurant",
      items: [
        { name: "Tables", href: "/admin/tables", icon: Armchair },
        { name: "Menu", href: "/superadmin/menu", icon: Utensils },
        { name: "Orders", href: "/superadmin/orders", icon: ClipboardList },
      ],
    },
    {
      label: "Finance",
      items: [
        { name: "Billing", href: "/superadmin/billing", icon: Receipt },
        { name: "Payments", href: "/admin/payments", icon: CreditCard },
        { name: "Invoices", href: "/admin/invoices", icon: FileText },
        { name: "Cash Recon", href: "/admin/reconciliation", icon: Landmark },
      ],
    },
    {
      label: "Facilities",
      items: [
        { name: "Activities", href: "/admin/activities", icon: Dumbbell },
        { name: "Gym", href: "/admin/gym", icon: Dumbbell },
        { name: "Gallery", href: "/admin/gallery", icon: Images },
        { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
      ],
    },
    {
      label: "Reports",
      items: [
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { name: "Reports", href: "/superadmin/reports", icon: FileBarChart },
        { name: "History", href: "/superadmin/history", icon: History },
      ],
    },
    {
      items: [
        { name: "Settings", href: "/superadmin/settings", icon: Settings },
      ],
    },
  ];

  const cashierSections: NavSection[] = [
    {
      items: [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "Front Desk",
      items: [
        { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
        { name: "Reservations", href: "/admin/reservations", icon: CalendarCheck },
        { name: "Rooms", href: "/admin/rooms", icon: BedDouble },
        { name: "Guests", href: "/admin/guests", icon: Users },
      ],
    },
    {
      label: "Restaurant",
      items: [
        { name: "Tables", href: "/admin/tables", icon: Armchair },
      ],
    },
    {
      label: "Finance",
      items: [
        { name: "Billing", href: "/admin/billing", icon: Receipt },
        { name: "Payments", href: "/admin/payments", icon: CreditCard },
        { name: "Cash Recon", href: "/admin/reconciliation", icon: Landmark },
      ],
    },
  ];

  const kitchenSections: NavSection[] = [
    {
      items: [
        { name: "Menu", href: "/admin/menu", icon: Utensils },
        { name: "Orders (KOT)", href: "/admin/orders", icon: ClipboardList },
      ],
    },
  ];

  const sections =
    role === "superadmin"
      ? superadminSections
      : role === "kitchen"
        ? kitchenSections
        : role === "cashier"
          ? cashierSections
          : adminSections;

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
        <nav className="space-y-4">
          {sections.map((section, si) => (
            <div key={si}>
              {section.label && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((link) => {
                  const isQRPattern =
                    pathname.startsWith("/admin/rooms/qr") ||
                    pathname.startsWith("/superadmin/rooms/qr");
                  const isActive = link.href.endsWith("/rooms")
                    ? pathname === link.href ||
                      (pathname.startsWith(link.href + "/") && !isQRPattern)
                    : pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
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
              </div>
            </div>
          ))}
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
