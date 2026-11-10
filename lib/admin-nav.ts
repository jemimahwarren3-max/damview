import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  Dumbbell,
  FileText,
  UtensilsCrossed,
  PartyPopper,
  Images,
  Settings,
  Users,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { label: "Rooms", href: "/admin/rooms", icon: BedDouble },
  { label: "Activities", href: "/admin/activities", icon: Dumbbell },
  { label: "Gym", href: "/admin/gym", icon: Dumbbell },
  { label: "Invoices", href: "/admin/invoices", icon: FileText },
  { label: "Menu", href: "/admin/menu", icon: UtensilsCrossed },
  { label: "Events", href: "/admin/events", icon: PartyPopper },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Staff", href: "/admin/staff", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
