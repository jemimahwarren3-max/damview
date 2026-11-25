"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { UtensilsCrossed, Activity } from "lucide-react";

interface Props {
  rawBills: { source: 'hotel'|'restaurant', room_charges: number, food_charges: number, total_amount: number, created_at: string }[];
  rawOrderItems: { name: string, quantity: number, created_at: string, source: 'hotel'|'restaurant' }[];
  roomStatusData: { name: string; value: number; color: string }[];
  recentCheckouts: any[];
}

type TimeRange = '7d' | '1m' | '6m' | '1y';
type SourceFilter = 'all' | 'rooms_hotel' | 'food_hotel' | 'food_restaurant';

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  borderRadius: "16px",
  boxShadow: "0 10px 15px -3px rgba(148, 163, 184, 0.1), 0 4px 6px -2px rgba(148, 163, 184, 0.05)",
  padding: "16px",
  color: "#262626",
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" className="text-[11px] font-bold pointer-events-none">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SuperadminCharts({ rawBills, rawOrderItems, roomStatusData, recentCheckouts }: Props) {
  const [timeFilter, setTimeFilter] = useState<TimeRange>('7d');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  
  const totalRooms = roomStatusData.reduce((s, d) => s + d.value, 0);

  // Time cutoff
  const getCutoffDate = (range: TimeRange) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (range === '7d') d.setDate(d.getDate() - 6);
    else if (range === '1m') d.setMonth(d.getMonth() - 1);
    else if (range === '6m') d.setMonth(d.getMonth() - 6);
    else if (range === '1y') d.setFullYear(d.getFullYear() - 1);
    return d.getTime();
  };

  const cutoffTime = getCutoffDate(timeFilter);

  // Filter processing
  const processAmount = (b: any, filter: SourceFilter) => {
    if (filter === 'all') return b.total_amount;
    if (filter === 'rooms_hotel' && b.source === 'hotel') return b.room_charges;
    if (filter === 'food_hotel' && b.source === 'hotel') return b.food_charges;
    if (filter === 'food_restaurant' && b.source === 'restaurant') return b.food_charges;
    return 0;
  };

  // 1. Revenue Trend Data
  const revenueData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    for (const b of rawBills) {
      const ts = new Date(b.created_at).getTime();
      if (ts < cutoffTime) continue;
      
      const amt = processAmount(b, sourceFilter);
      if (amt <= 0) continue;

      const dateStr = new Date(b.created_at).toLocaleDateString("en-US", { 
        month: timeFilter === '7d' || timeFilter === '1m' ? 'short' : 'short', 
        day: 'numeric' 
      });
      dataMap[dateStr] = (dataMap[dateStr] || 0) + amt;
    }
    
    // Sort chronologically
    return Object.entries(dataMap)
      .map(([day, revenue]) => ({ day, revenue, timestamp: new Date(day).getTime() }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [rawBills, cutoffTime, sourceFilter, timeFilter]);

  // 2. Most Ordered Items Data
  const topItems = useMemo(() => {
    const itemMap: Record<string, number> = {};
    for (const item of rawOrderItems) {
      if (new Date(item.created_at).getTime() < cutoffTime) continue;
      
      // Filter logic for items
      if (sourceFilter === 'rooms_hotel') continue; // Rooms don't have food orders
      if (sourceFilter === 'food_hotel' && item.source !== 'hotel') continue;
      if (sourceFilter === 'food_restaurant' && item.source !== 'restaurant') continue;

      itemMap[item.name] = (itemMap[item.name] || 0) + item.quantity;
    }
    return Object.entries(itemMap).sort(([, a], [, b]) => b - a).slice(0, 8);
  }, [rawOrderItems, cutoffTime, sourceFilter]);

  // 3. Lifetime Monthly Revenue (Always 12 months)
  const monthlyRevenue = useMemo(() => {
    const mRev = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      d.setDate(1); d.setHours(0,0,0,0);
      const next = new Date(d); next.setMonth(next.getMonth() + 1);
      
      const monthBills = rawBills.filter(b => {
        const ts = new Date(b.created_at).getTime();
        return ts >= d.getTime() && ts < next.getTime();
      });
      
      mRev.push({
        month: d.toLocaleDateString("en-US", { month: "short" }),
        room: monthBills.reduce((s, b) => s + b.room_charges, 0),
        food: monthBills.reduce((s, b) => s + b.food_charges, 0),
        others: monthBills.reduce((s, b) => s + (b.total_amount - b.room_charges - b.food_charges), 0),
      });
    }
    return mRev;
  }, [rawBills]);

  // 4. Lifetime Revenue Source breakdown
  const revenueBreakdown = useMemo(() => {
    let totRoom = 0, totFood = 0, totOther = 0;
    for (const b of rawBills) {
      totRoom += b.room_charges;
      totFood += b.food_charges;
      const other = b.total_amount - b.room_charges - b.food_charges;
      if (other > 0) totOther += other;
    }
    return [
      { name: "Rooms & Lodging", value: totRoom, color: "#2563eb" },
      { name: "Food & Dining", value: totFood, color: "#f59e0b" },
      { name: "Taxes & Extras", value: totOther, color: "#10b981" },
    ];
  }, [rawBills]);

  const totalRevenueLife = revenueBreakdown.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-10 py-4">
      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between premium-chart-card p-6 border border-neutral-200">
        <div className="flex bg-neutral-100 p-1 rounded-xl">
            {(['7d', '1m', '6m', '1y'] as TimeRange[]).map((tr) => (
                <button
                    key={tr}
                    onClick={() => setTimeFilter(tr)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${timeFilter === tr ? 'bg-white shadow-sm text-neutral-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                    {tr === '7d' ? '7 Days' : tr === '1m' ? '1 Month' : tr === '6m' ? '6 Months' : '1 Year'}
                </button>
            ))}
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-xl flex-wrap">
            {[
                { val: 'all', label: 'All Revenue' },
                { val: 'rooms_hotel', label: 'Rooms (Hotel)' },
                { val: 'food_hotel', label: 'Food (Hotel)' },
                { val: 'food_restaurant', label: 'Food (Rest.)' }
            ].map(src => (
                <button
                    key={src.val}
                    onClick={() => setSourceFilter(src.val as SourceFilter)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${sourceFilter === src.val ? 'bg-white shadow-sm text-emerald-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                    {src.label}
                </button>
            ))}
        </div>
      </div>

      {/* Row 1: Trend + Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 premium-chart-card group p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-neutral-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                <h3 className="text-xl font-bold text-neutral-800 tracking-tight leading-none">Filtered Revenue Trend</h3>
              </div>
            </div>
          </div>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="saAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#a3a3a3", fontSize: 13, fontWeight: 700 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a3a3a3", fontSize: 13, fontWeight: 700 }} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={tooltipStyle} className="animate-fade-in translate-y-[-10px] min-w-[150px]">
                          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest mb-2 pb-2 border-b border-neutral-100">{label}</p>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-2xl font-bold text-neutral-800 leading-none tracking-tight">${Number(payload[0].value).toLocaleString('en-US')}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={4} fillOpacity={1} fill="url(#saAreaGradient)" isAnimationActive={false} dot={{ r: 5, fill: "#fff", stroke: "#2563eb", strokeWidth: 3 }} activeDot={{ r: 8, fill: "#1d4ed8", stroke: "#fff", strokeWidth: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Ordered Items */}
        <div className="lg:col-span-4 premium-chart-card p-6">
          <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2 mb-5">
            <UtensilsCrossed className="h-5 w-5 text-amber-500" /> Filtered Top Items
          </h3>
          {topItems.length === 0 ? (
            <p className="text-neutral-400 italic text-sm text-center py-8">No order data in range.</p>
          ) : (
            <div className="space-y-3">
              {topItems.map(([name, count], idx) => {
                const maxCount = topItems[0]?.[1] || 1;
                const pct = Math.round((Number(count) / maxCount) * 100);
                return (
                  <div key={name} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${idx === 0 ? "bg-amber-100 text-amber-700" : idx === 1 ? "bg-neutral-200 text-neutral-600" : idx === 2 ? "bg-orange-100 text-orange-700" : "bg-neutral-100 text-neutral-500"}`}>{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-neutral-800 text-sm truncate">{name}</span>
                        <span className="text-xs font-bold text-neutral-500 ml-2 flex-shrink-0">{Number(count)}</span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-neutral-400 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 premium-chart-card p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" /><h3 className="text-xl font-bold text-neutral-800 tracking-tight leading-none">Monthly Performance</h3></div>
              <p className="text-sm font-semibold text-neutral-400">Comparing components (12 Months)</p>
            </div>
            <div className="flex gap-4 p-2 bg-neutral-50/80 rounded-xl border border-neutral-100 shadow-sm flex-wrap">
              <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-white shadow-sm border border-neutral-100"><div className="w-3.5 h-3.5 rounded-md bg-neutral-500 shadow-sm" /><span className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest leading-none">Lodging</span></div>
              <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-white shadow-sm border border-neutral-100"><div className="w-3.5 h-3.5 rounded-md bg-amber-500 shadow-sm" /><span className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest leading-none">Dining</span></div>
              <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-white shadow-sm border border-neutral-100"><div className="w-3.5 h-3.5 rounded-md bg-teal-500 shadow-sm" /><span className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest leading-none">Taxes & Extras</span></div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} barGap={8} barCategoryGap="15%">
                <defs>
                  <linearGradient id="saLodgingGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#1d4ed8" /></linearGradient>
                  <linearGradient id="saDiningGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient>
                  <linearGradient id="saExtraGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#10b981" /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#a3a3a3", fontSize: 13, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a3a3a3", fontSize: 12, fontWeight: 700 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const total = payload.reduce((s, p) => s + Number(p.value), 0);
                      return (
                        <div style={tooltipStyle} className="min-w-[190px]">
                          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest mb-3 border-b border-neutral-100 pb-2">{label} Revenue Breakdown</p>
                          <div className="space-y-3 mb-4">
                            {payload.map((p: any, i: number) => (
                              <div key={i} className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.dataKey === 'room' ? '#2563eb' : p.dataKey === 'food' ? '#f59e0b' : '#10b981' }} /><span className="text-xs font-bold text-neutral-500">{p.dataKey === 'room' ? 'Lodging' : p.dataKey === 'food' ? 'Dining' : 'Taxes & Extras'}</span></div>
                                <span className="text-sm font-bold text-neutral-800 tracking-tight">${Number(p.value).toLocaleString('en-US')}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-3 border-t-2 border-neutral-100 flex justify-between items-center bg-neutral-50/50 -mx-4 px-4 rounded-b-xl">
                            <span className="text-[10px] font-bold uppercase text-neutral-500">Gross Total</span>
                            <span className="text-base font-bold text-neutral-900 tracking-tight">${total.toLocaleString('en-US')}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ fill: "#fafafa" }}
                />
                <Bar dataKey="room" stackId="a" fill="url(#saLodgingGradient)" radius={[0, 0, 4, 4]} isAnimationActive={false} maxBarSize={45} />
                <Bar dataKey="food" stackId="a" fill="url(#saDiningGradient)" radius={[0, 0, 0, 0]} isAnimationActive={false} maxBarSize={45} />
                <Bar dataKey="others" stackId="a" fill="url(#saExtraGradient)" radius={[10, 10, 0, 0]} isAnimationActive={false} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-12 pt-10 border-t border-neutral-100">
            <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-neutral-500" /> Recent Room Checkouts
            </h3>
            {recentCheckouts && recentCheckouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                {recentCheckouts.map((g: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-neutral-50 text-neutral-600 flex items-center justify-center text-[10px] font-bold border border-neutral-100">
                        {g.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-neutral-800 leading-tight">{g.name}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight mt-0.5">Room {g.rooms?.room_number}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase bg-neutral-50 px-2 py-1 rounded-md">
                      {g.check_out ? new Date(g.check_out).toLocaleDateString("en-US", { day: "numeric", month: "short" }) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400 italic text-center py-4">No recent checkouts.</p>
            )}
          </div>
        </div>

        {/* Room occupany vs Revenue source */}
        <div className="lg:col-span-4 space-y-10">
            <div className="premium-chart-card flex flex-col p-8 group">
                <div className="mb-6 text-center md:text-left"><h3 className="text-xl font-bold text-neutral-800 tracking-tight leading-none mb-1.5">Room Occupancy</h3><p className="text-sm font-semibold text-neutral-400">{totalRooms} total rooms</p></div>
                <div className="h-[280px] w-full relative"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={roomStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={0} dataKey="value" isAnimationActive={false} stroke="none" labelLine={false} label={renderCustomLabel}>{roomStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip content={({ active, payload }) => { if (active && payload && payload.length) { const total = payload[0].payload.value; const percent = totalRooms > 0 ? ((total / totalRooms) * 100).toFixed(0) : 0; return (<div style={tooltipStyle} className="scale-90"><p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest mb-1">{payload[0].name}</p><p className="text-2xl font-bold text-neutral-800 tracking-tight">{total} Rooms ({percent}%)</p></div>); } return null; }} /></PieChart></ResponsiveContainer></div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 pt-4 border-t border-neutral-100">{roomStatusData.map((item, idx) => (<div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-100/50 group hover:bg-white transition-all"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-[10px] font-bold text-neutral-600 uppercase tracking-tight">{item.name}</span></div>))}</div>
            </div>

            <div className="premium-chart-card flex flex-col p-8 group">
                <div className="mb-6 text-center md:text-left"><h3 className="text-xl font-bold text-neutral-800 tracking-tight leading-none mb-1.5">Lifetime Revenue</h3><p className="text-sm font-semibold text-neutral-400">By Source</p></div>
                <div className="h-[280px] w-full relative"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={revenueBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={0} dataKey="value" isAnimationActive={false} stroke="none" labelLine={false} label={renderCustomLabel}>{revenueBreakdown.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip content={({ active, payload }) => { if (active && payload && payload.length) { const total = payload[0].payload.value; const percent = totalRevenueLife > 0 ? ((total / totalRevenueLife) * 100).toFixed(0) : 0; return (<div style={tooltipStyle} className="scale-90"><p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest mb-1">{payload[0].name}</p><p className="text-2xl font-bold text-neutral-800 tracking-tight">${total.toLocaleString('en-US')} ({percent}%)</p></div>); } return null; }} /></PieChart></ResponsiveContainer></div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 pt-4 border-t border-neutral-100">{revenueBreakdown.map((item, idx) => (<div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-100/50 group hover:bg-white transition-all"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-[10px] font-bold text-neutral-600 uppercase tracking-tight">{item.name}</span></div>))}</div>
            </div>
        </div>

      </div>
    </div>
  );
}
