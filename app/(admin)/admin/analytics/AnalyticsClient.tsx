"use client";

import { useState, useTransition } from "react";
import {
  BedDouble,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { getAnalytics } from "@/lib/actions/analytics";

type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;

const PERIODS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
] as const;

export default function AnalyticsClient({ data: initial }: { data: AnalyticsData }) {
  const [data, setData] = useState(initial);
  const [period, setPeriod] = useState(30);
  const [isPending, startTransition] = useTransition();

  const changePeriod = (days: number) => {
    setPeriod(days);
    startTransition(async () => {
      const result = await getAnalytics(days);
      setData(result);
    });
  };

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatHours = (h: number) => {
    if (h < 24) return `${h}h`;
    const days = Math.floor(h / 24);
    const rem = h % 24;
    return rem > 0 ? `${days}d ${rem}h` : `${days}d`;
  };

  const kpis = [
    { label: "Occupancy Rate", value: `${data.occupancyRate}%`, sub: `${data.occupiedNow}/${data.totalRooms} rooms`, icon: BedDouble, bg: "bg-blue-50", ic: "text-blue-600" },
    { label: "Total Revenue", value: fmt(data.totalRevenue), sub: `${data.totalCheckouts} checkouts`, icon: DollarSign, bg: "bg-emerald-50", ic: "text-emerald-600" },
    { label: "Room Revenue", value: fmt(data.totalRoomRevenue), sub: `${Math.round((data.totalRoomRevenue / (data.totalRevenue || 1)) * 100)}% of total`, icon: TrendingUp, bg: "bg-neutral-50", ic: "text-neutral-700" },
    { label: "Food Revenue", value: fmt(data.totalFoodRevenue), sub: `${Math.round((data.totalFoodRevenue / (data.totalRevenue || 1)) * 100)}% of total`, icon: BarChart3, bg: "bg-amber-50", ic: "text-amber-600" },
    { label: "Avg Stay", value: formatHours(data.avgStayHours), sub: "per guest", icon: Clock, bg: "bg-purple-50", ic: "text-purple-600" },
    { label: "Active Guests", value: data.activeGuests, sub: "checked in now", icon: Users, bg: "bg-rose-50", ic: "text-rose-600" },
  ];

  const maxRevenue = Math.max(...data.revenueTimeline.map((d) => d.amount), 1);

  return (
    <div className="space-y-8">
      <div className="page-header flex-wrap gap-4">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="page-subtitle">Occupancy, revenue and stay metrics.</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-neutral-200 p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => changePeriod(p.value)}
              disabled={isPending}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === p.value
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`kpi-grid grid-cols-2 md:grid-cols-3 ${isPending ? "opacity-50" : ""}`}>
        {kpis.map((k) => (
          <div key={k.label} className="kpi-cell">
            <div className="flex items-center gap-2.5 mb-4">
              <div className={`${k.bg} p-2 rounded-lg`}>
                <k.icon className={`h-4 w-4 ${k.ic}`} />
              </div>
              <p className="eyebrow">{k.label}</p>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-neutral-900 truncate">{k.value}</p>
            <p className="text-xs text-neutral-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {data.revenueTimeline.length > 0 && (
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="font-display text-base font-semibold tracking-tight text-neutral-900">
              Daily Revenue
            </h3>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-[2px] h-48">
              {data.revenueTimeline.map((d) => {
                const pct = (d.amount / maxRevenue) * 100;
                return (
                  <div
                    key={d.date}
                    className="flex-1 group relative"
                    title={`${d.date}: ${fmt(d.amount)}`}
                  >
                    <div
                      className="bg-neutral-900 rounded-t-sm w-full transition-all group-hover:bg-emerald-600"
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-neutral-400">
              <span>{data.revenueTimeline[0]?.date}</span>
              <span>{data.revenueTimeline[data.revenueTimeline.length - 1]?.date}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.topRooms.length > 0 && (
          <div className="dash-card">
            <div className="dash-card-header">
              <h3 className="font-display text-base font-semibold tracking-tight text-neutral-900">
                Top Rooms by Revenue
              </h3>
            </div>
            <div className="divide-y divide-neutral-100">
              {data.topRooms.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-bold">
                      {r.roomNumber}
                    </div>
                    <span className="text-sm text-neutral-600">{r.stays} stays</span>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">{fmt(r.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(data.paymentModeBreakdown).length > 0 && (
          <div className="dash-card">
            <div className="dash-card-header">
              <h3 className="font-display text-base font-semibold tracking-tight text-neutral-900">
                Payment Methods
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {Object.entries(data.paymentModeBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([mode, amount]) => {
                  const pct = Math.round((amount / (data.totalRevenue || 1)) * 100);
                  return (
                    <div key={mode}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-700 font-medium">{mode}</span>
                        <span className="text-neutral-900 font-semibold">{fmt(amount)} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-900 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
