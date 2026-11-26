"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const DashboardCharts = dynamic(
  () => import("@/components/dashboard/DashboardCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="premium-chart-card p-6 min-h-[360px] flex items-center justify-center text-sm text-neutral-400">
        Loading charts...
      </div>
    ),
  },
);

type Props = {
  rawBills: { source: 'hotel'|'restaurant', room_charges: number, food_charges: number, total_amount: number, created_at: string }[];
  rawOrderItems: { name: string, quantity: number, created_at: string, source: 'hotel'|'restaurant' }[];
  roomStatusData: { name: string; value: number; color: string }[];
};

export default function LazyAdminCharts(props: Props) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return;

    const node = anchorRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [shouldRender]);

  return <div ref={anchorRef}>{shouldRender ? <DashboardCharts {...props} /> : <div className="premium-chart-card p-6 min-h-[360px]" />}</div>;
}
