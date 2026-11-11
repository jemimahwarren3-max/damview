import type { Metadata } from "next";
import { RegisterServiceWorker } from "@/components/admin/RegisterServiceWorker";

export const metadata: Metadata = {
  title: "Staff, Damview Resort",
  robots: { index: false, follow: false },
  manifest: "/admin-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Damview Staff",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <RegisterServiceWorker />
      {children}
    </div>
  );
}
