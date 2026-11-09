import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff — Dam View Resort",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full">{children}</div>;
}
