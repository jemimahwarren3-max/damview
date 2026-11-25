import { createClient } from "@/lib/supabase/server";
import { getOrSetVersionedCache } from "@/lib/cache/redis";
import LazyAdminCharts from "@/app/(admin)/admin/dashboard/LazyAdminCharts";
import {
  BedDouble,
  DollarSign,
  ClipboardList,
  Users,
  Utensils,
  TrendingUp,
} from "lucide-react";


export default async function SuperadminDashboard() {
  const {
    rawBills,
    rawOrderItems,
    totalRooms,
    occupiedCount,
    availableCount,
    cleaningCount,
    pendingOrdersCount,
    activeGuestsCount,
    activeMenuCount,
    recentCheckouts,
  } = await getOrSetVersionedCache({
    domain: "dashboard",
    key: "superadmin:dashboard:overview:1y",
    ttlSeconds: 15,
    loader: async () => {
      const supabase = await createClient();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      const startIso = startDate.toISOString();

      const [
        billsRes,
        restBillsRes,
        { count: totalRooms },
        { count: occupiedCount },
        { count: availableCount },
        { count: cleaningCount },
        { count: pendingOrdersCount },
        { count: activeGuestsCount },
        { count: activeMenuCount },
        recentCheckoutsResult,
        orderItemsRes,
      ] = await Promise.all([
        supabase
          .from("bills")
          .select("total_amount, room_charges, food_charges, created_at")
          .gte("created_at", startIso),
        supabase
          .from("restaurant_bills")
          .select("total_amount, food_charges, created_at")
          .gte("created_at", startIso),
        supabase.from("rooms").select("*", { count: "exact", head: true }),
        supabase
          .from("rooms")
          .select("*", { count: "exact", head: true })
          .eq("status", "occupied"),
        supabase
          .from("rooms")
          .select("*", { count: "exact", head: true })
          .eq("status", "available"),
        supabase
          .from("rooms")
          .select("*", { count: "exact", head: true })
          .eq("status", "cleaning"),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("guests")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("food_menu")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("guests")
          .select("name, check_out, rooms:room_id ( room_number )")
          .eq("is_active", false)
          .order("check_out", { ascending: false })
          .limit(5),
        supabase
          .from("order_items")
          .select(
            "quantity, custom_name, orders!inner(created_at, room_id, table_id, status), food_menu(name)",
          )
          .neq("orders.status", "cancelled")
          .gte("orders.created_at", startIso)
          .order("orders(created_at)", { ascending: false })
          .limit(4000),
      ]);

      const rawBills = [
        ...(billsRes.data || []).map((b) => ({
          source: "hotel" as const,
          total_amount: Number(b.total_amount),
          room_charges: Number(b.room_charges || 0),
          food_charges: Number(b.food_charges || 0),
          created_at: b.created_at,
        })),
        ...(restBillsRes.data || []).map((b) => ({
          source: "restaurant" as const,
          total_amount: Number(b.total_amount),
          room_charges: 0,
          food_charges: Number(b.food_charges || 0),
          created_at: b.created_at,
        })),
      ];

      const rawOrderItems = (orderItemsRes.data || []).map((oi: any) => ({
        name: oi.custom_name || oi.food_menu?.name || "Unknown Item",
        quantity: Number(oi.quantity),
        created_at: oi.orders?.created_at,
        source: oi.orders?.room_id ? "hotel" : "restaurant",
      }));

      return {
        rawBills,
        rawOrderItems,
        totalRooms: totalRooms || 0,
        occupiedCount: occupiedCount || 0,
        availableCount: availableCount || 0,
        cleaningCount: cleaningCount || 0,
        pendingOrdersCount: pendingOrdersCount || 0,
        activeGuestsCount: activeGuestsCount || 0,
        activeMenuCount: activeMenuCount || 0,
        recentCheckouts: recentCheckoutsResult.data || [],
      };
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayTime = today.getTime();
  const tomorrowTime = tomorrow.getTime();

  let todaysRevenue = 0;
  for (const b of rawBills) {
    const t = new Date(b.created_at).getTime();
    if (t >= todayTime && t < tomorrowTime)
      todaysRevenue += b.total_amount || 0;
  }

  const roomStatusData = [
    { name: "Available", value: availableCount || 0, color: "#10b981" },
    { name: "Occupied", value: occupiedCount || 0, color: "#2563eb" },
    { name: "Cleaning", value: cleaningCount || 0, color: "#f59e0b" },
  ];

  const stats = [
    {
      label: "Occupied Rooms",
      value: `${occupiedCount || 0}/${totalRooms || 0}`,
      icon: BedDouble,
      bgColor: "bg-neutral-50",
      iconColor: "text-neutral-900",
    },
    {
      label: "Today's Revenue",
      value: `$${todaysRevenue.toLocaleString("en-US")}`,
      icon: DollarSign,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Pending Orders",
      value: pendingOrdersCount || 0,
      icon: ClipboardList,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Active Guests",
      value: activeGuestsCount || 0,
      icon: Users,
      bgColor: "bg-neutral-50",
      iconColor: "text-neutral-600",
    },
    {
      label: "Available Rooms",
      value: availableCount || 0,
      icon: BedDouble,
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      label: "Menu Items",
      value: activeMenuCount || 0,
      icon: Utensils,
      bgColor: "bg-rose-50",
      iconColor: "text-rose-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div>
          <h2 className="page-title">Superadmin Dashboard</h2>
          <p className="page-subtitle">
            Real-time snapshot of your hotel operations.
          </p>
        </div>
      </div>

      <div className="kpi-grid grid-cols-2 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="kpi-cell">
            <div className="flex items-center gap-2.5 mb-4">
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
              <p className="eyebrow">{stat.label}</p>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-neutral-900 truncate">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <LazyAdminCharts
        rawBills={rawBills as any}
        rawOrderItems={rawOrderItems as any}
        roomStatusData={roomStatusData}
      />

      <div className="dash-card">
        <div className="dash-card-header">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-neutral-500" />
            <h3 className="font-display text-base font-semibold tracking-tight text-neutral-900">
              Recent Checkouts
            </h3>
          </div>
        </div>
        {recentCheckouts && recentCheckouts.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {recentCheckouts.map((g: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-semibold">
                    {g.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-neutral-900">
                      {g.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Room {g.rooms?.room_number}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-neutral-400 font-medium">
                  {g.check_out
                    ? new Date(g.check_out).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                      })
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-400 text-center py-10">
            No recent checkouts yet.
          </p>
        )}
      </div>
    </div>
  );
}
