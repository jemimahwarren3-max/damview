import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff, Damview Resort",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full">{children}</div>;
}
