"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  Utensils,
  BedDouble,
  Calendar,
  Filter,
  ArrowUpRight,
  Award,
  History,
} from "lucide-react";

interface Props {
  rawBills: {
    source: "hotel" | "restaurant";
    room_charges: number;
    food_charges: number;
    total_amount: number;
    created_at: string;
  }[];
  rawOrderItems: {
    name: string;
    quantity: number;
    created_at: string;
    source: "hotel" | "restaurant";
  }[];
  roomStatusData: { name: string; value: number; color: string }[];
}

type TimeRange = "7d" | "1m" | "6m" | "1y";
type SourceFilter = "all" | "rooms_hotel" | "food_hotel" | "food_restaurant";

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e5e5",
  borderRadius: "10px",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  padding: "12px 14px",
  color: "#171717",
};

export default function DashboardCharts({
  rawBills,
  rawOrderItems,
  roomStatusData,
}: Props) {
  const [timeFilter, setTimeFilter] = useState<TimeRange>("7d");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const totalRooms = useMemo(
    () => roomStatusData.reduce((s, d) => s + d.value, 0),
    [roomStatusData],
  );

  // Time cutoff logic
  const cutoffTime = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (timeFilter === "7d") d.setDate(d.getDate() - 6);
    else if (timeFilter === "1m") d.setMonth(d.getMonth() - 1);
    else if (timeFilter === "6m") d.setMonth(d.getMonth() - 6);
    else if (timeFilter === "1y") d.setFullYear(d.getFullYear() - 1);
    return d.getTime();
  }, [timeFilter]);

  // Filter processing
  const processAmount = (b: any, filter: SourceFilter) => {
    const val = (v: any) => Number(v || 0);
    if (filter === "all") return val(b.total_amount);
    if (filter === "rooms_hotel" && b.source === "hotel")
      return val(b.room_charges);
    if (filter === "food_hotel" && b.source === "hotel")
      return val(b.food_charges);
    if (filter === "food_restaurant" && b.source === "restaurant")
      return val(b.food_charges);
    return 0;
  };

  // 1. Revenue Trend Data
  const revenueData = useMemo(() => {
    const dataMap: Record<string, number> = {};

    // Fill gaps with 0s for the selected range (especially for 7d)
    if (timeFilter === "7d") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        dataMap[key] = 0;
      }
    }

    for (const b of rawBills) {
      const bDate = new Date(b.created_at);
      const ts = bDate.getTime();
      if (ts < cutoffTime) continue;

      const amt = processAmount(b, sourceFilter);
      const key = bDate.toISOString().split("T")[0];
      dataMap[key] = (dataMap[key] || 0) + amt;
    }

    return Object.entries(dataMap)
      .map(([date, revenue]) => {
        const d = new Date(date);
        return {
          date,
          day: d.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          }),
          revenue,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [rawBills, cutoffTime, sourceFilter, timeFilter]);

  // 2. Top Items Data
  const topItems = useMemo(() => {
    const itemMap: Record<string, number> = {};
    for (const oi of rawOrderItems) {
      const ts = new Date(oi.created_at).getTime();
      if (ts < cutoffTime) continue;

      if (sourceFilter === "rooms_hotel") continue;
      if (sourceFilter === "food_hotel" && oi.source !== "hotel") continue;
      if (sourceFilter === "food_restaurant" && oi.source !== "restaurant")
        continue;

      itemMap[oi.name] = (itemMap[oi.name] || 0) + Number(oi.quantity);
    }
    return Object.entries(itemMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [rawOrderItems, cutoffTime, sourceFilter]);

  // 3. Lifetime Monthly Revenue
  const monthlyRevenue = useMemo(() => {
    const mRev = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthBills = rawBills.filter((b) => {
        const ts = new Date(b.created_at).getTime();
        return ts >= d.getTime() && ts < next.getTime();
      });

      mRev.push({
        month: d.toLocaleDateString("en-US", { month: "short" }),
        revenue: monthBills.reduce(
          (s, b) => s + Number(b.total_amount || 0),
          0,
        ),
        room: monthBills.reduce((s, b) => s + Number(b.room_charges || 0), 0),
        food: monthBills.reduce((s, b) => s + Number(b.food_charges || 0), 0),
        others: monthBills.reduce((s, b) => {
          const room = Number(b.room_charges || 0);
          const food = Number(b.food_charges || 0);
          const total = Number(b.total_amount || 0);
          return s + Math.max(0, total - room - food);
        }, 0),
      });
    }
    return mRev;
  }, [rawBills]);

  const sourceOptions = [
    { id: "all", label: "All" },
    { id: "rooms_hotel", label: "Lodging" },
    { id: "food_hotel", label: "Hotel Dining" },
    { id: "food_restaurant", label: "Restaurant" },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Filter Row — dub segmented controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="seg-group">
          {sourceOptions.map((src) => (
            <button
              key={src.id}
              onClick={() => setSourceFilter(src.id as any)}
              data-active={sourceFilter === src.id}
              className="seg-item"
            >
              {src.label}
            </button>
          ))}
        </div>

        <div className="seg-group">
          {(["7d", "1m", "6m", "1y"] as TimeRange[]).map((tr) => (
            <button
              key={tr}
              onClick={() => setTimeFilter(tr)}
              data-active={timeFilter === tr}
              className="seg-item"
            >
              {tr === "7d"
                ? "7 Days"
                : tr === "1m"
                  ? "1 Mo"
                  : tr === "6m"
                    ? "6 Mo"
                    : "1 Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Trend + Top Items */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Chart Card */}
        <div className="xl:col-span-8 dash-card overflow-hidden">
          <div className="dash-card-header">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-4 w-4 text-neutral-500" />
              <div>
                <h3 className="font-display text-base font-semibold text-neutral-900 tracking-tight">
                  Revenue Analytics
                </h3>
                <p className="eyebrow mt-0.5">Growth &amp; Trends</p>
              </div>
            </div>
            <div className="text-right">
              <p className="eyebrow leading-none">Total in Range</p>
              <p className="text-xl font-semibold tracking-tight text-neutral-900 mt-1">
                $
                {revenueData
                  .reduce((s, d) => s + d.revenue, 0)
                  .toLocaleString("en-US")}
              </p>
            </div>
          </div>

          <div className="h-[380px] w-full p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f5f5f5"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#737373", fontSize: 11, fontWeight: 500 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#737373", fontSize: 11, fontWeight: 500 }}
                  tickFormatter={(v) =>
                    `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                  }
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div
                          style={tooltipStyle}
                          className="min-w-[180px] border-none"
                        >
                          <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest mb-3 border-b border-neutral-100 pb-2">
                            {label}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-neutral-900 leading-none">
                              $
                              {Number(payload[0].value).toLocaleString("en-US")}
                            </span>
                            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#revGradient)"
                  isAnimationActive={false}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#2563eb",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items - Best Sellers */}
        <div className="xl:col-span-4 dash-card flex flex-col">
          <div className="dash-card-header">
            <div className="flex items-center gap-2.5">
              <Award className="h-4 w-4 text-neutral-500" />
              <h3 className="font-display text-base font-semibold text-neutral-900 tracking-tight">
                Best Sellers
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-neutral-100 rounded-md text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
              {timeFilter}
            </span>
          </div>

          <div className="dash-card-body space-y-4 flex-1 overflow-auto custom-scrollbar">
            {topItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-300">
                <History className="h-8 w-8 mb-3" />
                <p className="text-sm font-medium text-neutral-400">
                  No sales found
                </p>
              </div>
            ) : (
              topItems.map(([name, count], idx) => {
                const maxCount = topItems[0]?.[1] || 1;
                const pct = Math.round((Number(count) / maxCount) * 100);
                return (
                  <div key={name}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-semibold w-5 text-neutral-400 tabular-nums">
                          {idx + 1}
                        </span>
                        <p className="font-medium text-neutral-900 text-sm truncate">
                          {name}
                        </p>
                      </div>
                      <p className="text-xs font-medium text-neutral-500 tabular-nums shrink-0 ml-2">
                        {Number(count)} units
                      </p>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-900 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Occupancy & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Occupancy Card */}
        <div className="lg:col-span-4 dash-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-neutral-900 tracking-tight flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-neutral-500" /> Room Inventory
            </h3>
            <p className="eyebrow mt-1">Live Status</p>
          </div>

          <div className="h-[240px] w-full relative">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={roomStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={92}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive={false}
                  stroke="#ffffff"
                  strokeWidth={3}
                  cornerRadius={3}
                  labelLine={false}
                >
                  {roomStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const total = payload[0].payload.value;
                      const percent =
                        totalRooms > 0
                          ? ((total / totalRooms) * 100).toFixed(0)
                          : 0;
                      return (
                        <div style={tooltipStyle}>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: payload[0].payload.color }}
                            />
                            <span className="text-xs font-medium text-neutral-500">
                              {payload[0].name}
                            </span>
                          </div>
                          <p className="text-lg font-semibold text-neutral-900">
                            {total}{" "}
                            <span className="text-xs font-normal text-neutral-400">
                              rooms · {percent}%
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-3xl font-semibold tracking-tight text-neutral-900 leading-none">
                {totalRooms}
              </p>
              <p className="eyebrow mt-1.5">Total Rooms</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-5 border-t border-neutral-200">
            {roomStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wide leading-none truncate">
                    {item.name}
                  </p>
                  <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Summary Bar Chart */}
        <div className="lg:col-span-8 dash-card">
          <div className="dash-card-header">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-neutral-500" />
              <div>
                <h3 className="font-display text-base font-semibold text-neutral-900 tracking-tight">
                  Monthly Performance
                </h3>
                <p className="eyebrow mt-0.5">Hospitality vs Dining</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#2563eb]" />
                <span className="text-xs font-medium text-neutral-500">Lodging</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
                <span className="text-xs font-medium text-neutral-500">Dining</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#14b8a6]" />
                <span className="text-xs font-medium text-neutral-500">Taxes &amp; Extras</span>
              </div>
            </div>
          </div>

          <div className="h-[340px] w-full p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} barGap={15} barCategoryGap="20%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f5f5f5"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#737373", fontSize: 11, fontWeight: 500 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#737373", fontSize: 11, fontWeight: 500 }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div
                          style={tooltipStyle}
                          className="min-w-[200px] border-none"
                        >
                          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest mb-4 border-b border-neutral-100 pb-3">
                            {label} Metrics
                          </p>
                          <div className="space-y-4">
                            {payload.map((p: any, i: number) => (
                              <div
                                key={i}
                                className="flex justify-between items-center"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{
                                      backgroundColor:
                                        p.dataKey === "room"
                                          ? "#2563eb"
                                          : p.dataKey === "food"
                                            ? "#f59e0b"
                                            : "#14b8a6",
                                    }}
                                  />
                                  <span className="text-xs font-bold text-neutral-500">
                                    {p.dataKey === "room"
                                      ? "Lodging"
                                      : p.dataKey === "food"
                                        ? "Dining"
                                        : "Taxes & Extras"}
                                  </span>
                                </div>
                                <span className="text-sm font-bold text-neutral-900">
                                  ${Number(p.value).toLocaleString("en-US")}
                                </span>
                              </div>
                            ))}
                            <div className="pt-3 border-t border-neutral-100 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                Total
                              </span>
                              <span className="text-md font-bold text-neutral-600">
                                $
                                {Number(
                                  payload[0].payload.revenue,
                                ).toLocaleString("en-US")}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ fill: "#fafafa", radius: 10 }}
                />
                <Bar
                  dataKey="room"
                  stackId="a"
                  fill="#2563eb"
                  radius={[0, 0, 4, 4]}
                  isAnimationActive={false}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="food"
                  stackId="a"
                  fill="#f59e0b"
                  radius={[0, 0, 0, 0]}
                  isAnimationActive={false}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="others"
                  stackId="a"
                  fill="#14b8a6"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={false}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
