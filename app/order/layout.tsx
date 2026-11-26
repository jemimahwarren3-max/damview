import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Food — Damview Resort",
  description: "Browse the menu and place your food order.",
};

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-50 font-sans">
      {children}
    </div>
  );
}
