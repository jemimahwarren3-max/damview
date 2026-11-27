import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCachedAuth } from "@/lib/supabase/cached-auth";
import { getOrSetVersionedCache } from "@/lib/cache/redis";
import { redirect } from "next/navigation";
import OrderBoard from "./OrderBoard";

export const metadata: Metadata = { title: "Orders" };
import { ClipboardList } from "lucide-react";

export default async function OrdersPage() {
  const { role } = await getCachedAuth();

  if (role === "cashier") redirect("/admin/billing");

  const { orders, error } = await getOrSetVersionedCache({
    domain: "orders",
    key: "admin:orders:active",
    ttlSeconds: 10,
    loader: async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("orders")
        .select(
          `*, order_items ( id, food_id, custom_name, quantity, price_snapshot, food_menu:food_id ( name ) ), rooms:room_id ( room_number ), restaurant_tables:table_id ( table_number )`,
        )
        .in("status", [
          "pending",
          "accepted",
          "preparing",
          "prepared",
          "served",
        ])
        .order("created_at", { ascending: true });
      return { orders: data || [], error: error?.message || null };
    },
  });

  if (error) {
    return (
      <div className="p-6 text-red-600">Failed to load orders: {error}</div>
    );
  }

  const pending = orders.filter((o: any) => o.status === "pending").length;
  const inProgress = orders.filter((o: any) =>
    ["accepted", "preparing", "prepared"].includes(o.status),
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-neutral-900">
            Orders (KOT)
          </h1>
          <p className="text-sm text-neutral-500">
            {pending} pending, {inProgress} in progress
          </p>
        </div>
      </div>

      <OrderBoard initialOrders={orders} role={role} />
    </div>
  );
}
