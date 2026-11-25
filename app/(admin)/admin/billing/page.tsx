import { createClient } from "@/lib/supabase/server";
import { getCachedAuth } from "@/lib/supabase/cached-auth";
import { getOrSetVersionedCache } from "@/lib/cache/redis";
import { redirect } from "next/navigation";
import BillingList from "./BillingList";
import { Receipt, DollarSign, Clock } from "lucide-react";
import RecentCheckoutList from "./RecentCheckoutList";
import RestaurantBillingList from "./RestaurantBillingList";
import BillingTabsClient from "./BillingTabsClient";


export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { role } = await getCachedAuth();
  if (role === "kitchen") redirect("/admin/orders");

  const { tab: rawTab } = await searchParams;
  const defaultTab = rawTab === "restaurant" ? "restaurant" : "hotel";

  const supabase = await createClient();
  const ACTIVE_GUEST_FIELDS =
    "id, room_id, name, guest_code, check_in, rate, gst_percent, email, gst_number, phone, id_proof_name, id_proof_number, rooms:room_id ( room_number, type )";
  const RECENT_CHECKOUT_FIELDS =
    "id, room_id, name, guest_code, check_in, check_out, email, gst_number, phone, id_proof_name, id_proof_number, rooms:room_id ( room_number, type )";
  const RECENT_CHECKOUT_LIMIT = 40;
  const RECENT_TABLE_BILLS_LIMIT = 40;
  const twentyFourHoursAgoDate = new Date();
  twentyFourHoursAgoDate.setHours(twentyFourHoursAgoDate.getHours() - 24);
  const twentyFourHoursAgo = twentyFourHoursAgoDate.toISOString();

  const {
    guests,
    error,
    recentCheckouts,
    restaurantTables,
    restaurantTablesError,
    recentTableBills,
    recentTableBillsError,
  } = await getOrSetVersionedCache({
    domain: "billing",
    key: "admin:billing:tab-seed",
    ttlSeconds: 10,
    loader: async () => {
      const [
        { data: guests, error },
        { data: recentCheckouts },
        { data: restaurantTables, error: restaurantTablesError },
        recentBillsResult,
      ] = await Promise.all([
        supabase
          .from("guests")
          .select(ACTIVE_GUEST_FIELDS)
          .eq("is_active", true)
          .order("check_in", { ascending: false }),
        supabase
          .from("guests")
          .select(RECENT_CHECKOUT_FIELDS)
          .eq("is_active", false)
          .gte("check_out", twentyFourHoursAgo)
          .order("check_out", { ascending: false })
          .limit(RECENT_CHECKOUT_LIMIT),
        supabase
          .from("restaurant_tables")
          .select("*")
          .order("table_number", { ascending: true }),
        supabase
          .from("restaurant_bills")
          .select(
            `id, table_id, food_charges, discount_amount, gst_amount, total_amount, payment_mode, created_at, items, restaurant_tables ( table_number )`,
          )
          .gte("created_at", twentyFourHoursAgo)
          .eq("payment_status", "paid")
          .order("created_at", { ascending: false })
          .limit(RECENT_TABLE_BILLS_LIMIT),
      ]);

      let recentTableBills: any[] = [];
      let recentTableBillsError: string | null = null;

      if (recentBillsResult.error) {
        const msg = (recentBillsResult.error.message || "").toLowerCase();
        const itemsColumnMissing =
          msg.includes("items") &&
          (msg.includes("schema cache") || msg.includes("column") || msg.includes("does not exist"));

        if (itemsColumnMissing) {
          const fallback = await supabase
            .from("restaurant_bills")
            .select(
              `id, table_id, food_charges, discount_amount, gst_amount, total_amount, payment_mode, created_at, restaurant_tables ( table_number )`,
            )
            .gte("created_at", twentyFourHoursAgo)
            .eq("payment_status", "paid")
            .order("created_at", { ascending: false })
            .limit(RECENT_TABLE_BILLS_LIMIT);
          recentTableBills = fallback.data || [];
          recentTableBillsError = fallback.error?.message || null;
        } else {
          recentTableBillsError = recentBillsResult.error.message || "Unknown error";
        }
      } else {
        recentTableBills = recentBillsResult.data || [];
      }

      return {
        guests: guests || [],
        recentCheckouts: recentCheckouts || [],
        restaurantTables: restaurantTables || [],
        recentTableBills,
        error: error?.message || null,
        restaurantTablesError: restaurantTablesError?.message || null,
        recentTableBillsError,
      };
    },
  });

  const restaurantFeatureUnavailable = [restaurantTablesError, recentTableBillsError].some(
    (err) => (err || "").toLowerCase().includes("restaurant_tables"),
  );

  // Hotel data
  const activeGuests = guests || [];
  const activeRoomIds = activeGuests.map((g) => g.room_id).filter(Boolean);
  const earliestActiveCheckIn = activeGuests.reduce<string | null>((earliest, guest) => {
    if (!guest?.check_in) return earliest;
    if (!earliest || guest.check_in < earliest) return guest.check_in;
    return earliest;
  }, null);

  // Restaurant data
  const allTables = !restaurantFeatureUnavailable ? restaurantTables || [] : [];
  const activeTableIds = allTables
    .filter((t) => t.status === "occupied")
    .map((t) => t.id)
    .filter(Boolean);

  // Fetch orders for both hotel and restaurant together in one parallel batch
  const [
    { data: servedOrders },
    { data: tableOrders, error: tableOrdersError },
    { data: latestPaidTableBills },
  ] = await Promise.all([
    activeRoomIds.length > 0
      ? (() => {
          let q = supabase
            .from("orders")
            .select(`room_id, status, order_items ( quantity, price_snapshot )`)
            .in("room_id", activeRoomIds)
            .in("status", ["served", "accepted", "preparing", "prepared", "pending"]);
          if (earliestActiveCheckIn) q = q.gte("created_at", earliestActiveCheckIn);
          return q;
        })()
      : Promise.resolve({ data: [], error: null }),
    activeTableIds.length > 0
      ? supabase
          .from("orders")
          .select(`table_id, created_at, status, order_items ( quantity, price_snapshot, custom_name, food_menu ( name ) )`)
          .in("table_id", activeTableIds)
          .in("status", ["served", "accepted", "preparing", "prepared", "pending"])
      : Promise.resolve({ data: [], error: null }),
    activeTableIds.length > 0
      ? supabase
          .from("restaurant_bills")
          .select("table_id, created_at")
          .in("table_id", activeTableIds)
          .eq("payment_status", "paid")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  // Recent checkout bills
  const recentCheckoutIds = (recentCheckouts || []).map((g) => g.id);
  const recentBillsByGuestId: Record<string, any> = {};
  if (recentCheckoutIds.length > 0) {
    const { data: recentBills } = await supabase
      .from("bills")
      .select(
        "guest_id, total_amount, room_charges, food_charges, extra_charges, extra_charges_details, discount_amount, gst_amount, payment_mode, payment_status, created_at",
      )
      .in("guest_id", recentCheckoutIds)
      .order("created_at", { ascending: false });
    for (const bill of recentBills || []) {
      if (bill.guest_id && !recentBillsByGuestId[bill.guest_id]) {
        recentBillsByGuestId[bill.guest_id] = bill;
      }
    }
  }

  // Build hotel ordersMap
  const activeRoomIdsSet = new Set(activeGuests.map((g) => g.room_id));
  const ordersMap: Record<string, number> = {};
  const hotelUnservedMap: Record<string, boolean> = {};
  (servedOrders || []).forEach((order) => {
    if (!order.room_id || !activeRoomIdsSet.has(order.room_id)) return;
    
    if (["pending", "accepted", "preparing", "prepared"].includes(order.status)) {
      hotelUnservedMap[order.room_id] = true;
    }

    const total = order.order_items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price_snapshot, 0,
    );
    ordersMap[order.room_id] = (ordersMap[order.room_id] || 0) + total;
  });

  // Build restaurant tableOrdersMap
  const tableOrdersMap: Record<string, number> = {};
  const tableItemsMap: Record<string, { name: string; quantity: number; price: number }[]> = {};
  const tableUnservedMap: Record<string, boolean> = {};
  const latestBillMap: Record<string, string> = {};
  for (const bill of latestPaidTableBills || []) {
    if (!bill.table_id) continue;
    if (!latestBillMap[bill.table_id]) latestBillMap[bill.table_id] = bill.created_at;
  }
  (tableOrders || []).forEach((order) => {
    if (!order.table_id) return;
    const lastBillAt = latestBillMap[order.table_id];
    if (lastBillAt && order.created_at <= lastBillAt) return;
    
    if (["pending", "accepted", "preparing", "prepared"].includes(order.status)) {
      tableUnservedMap[order.table_id] = true;
    }

    const total = order.order_items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price_snapshot, 0,
    );
    tableOrdersMap[order.table_id] = (tableOrdersMap[order.table_id] || 0) + total;
    const tid = order.table_id as string;
    if (!tableItemsMap[tid]) tableItemsMap[tid] = [];
    order.order_items.forEach((item: any) => {
      tableItemsMap[tid].push({
        name: item.custom_name || item.food_menu?.name || "Unknown Item",
        quantity: item.quantity,
        price: item.price_snapshot,
      });
    });
  });

  if (error)
    return <div className="p-8 text-red-500">Error loading billing data: {error}</div>;

  const recentlyCheckedOut = (recentCheckouts || []).map((guest) => ({
    ...guest,
    bills: recentBillsByGuestId[guest.id] || null,
  }));
  const hotelFoodTotal = Object.values(ordersMap).reduce((s, v) => s + v, 0);
  const tableFoodTotal = Object.values(tableOrdersMap).reduce((s, v) => s + v, 0);
  const occupiedTableCount = allTables.filter((t) => t.status === "occupied").length;

  const hotelContent = (
    <div className="space-y-6">
      <div className="kpi-grid grid-cols-2">
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-neutral-100 p-2.5 rounded-xl">
            <Receipt className="h-5 w-5 text-neutral-900" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Active Bills</p>
            <p className="text-2xl font-semibold text-neutral-900">{activeGuests.length}</p>
          </div>
        </div>
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-emerald-100 p-2.5 rounded-xl">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Food Charges</p>
            <p className="text-2xl font-semibold text-neutral-900">${hotelFoodTotal.toLocaleString("en-US")}</p>
          </div>
        </div>
      </div>
      <BillingList activeGuests={activeGuests} ordersMap={ordersMap} unservedMap={hotelUnservedMap} />
      {recentlyCheckedOut.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Recently Checked Out</h3>
              <p className="text-xs text-neutral-500">Bills available for reprinting for 24 hours after checkout.</p>
            </div>
          </div>
          <RecentCheckoutList guests={recentlyCheckedOut} />
        </div>
      )}
    </div>
  );

  const restaurantContent = (
    <div className="space-y-6">
      {restaurantFeatureUnavailable && (
        <div className="px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium">
          Restaurant billing is unavailable in this database. Run the latest Supabase migrations to enable tables and restaurant bills.
        </div>
      )}
      <div className="kpi-grid grid-cols-2">
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-amber-100 p-2.5 rounded-xl">
            <Receipt className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Occupied Tables</p>
            <p className="text-2xl font-semibold text-neutral-900">{occupiedTableCount}</p>
          </div>
        </div>
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-emerald-100 p-2.5 rounded-xl">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Table Food Charges</p>
            <p className="text-2xl font-semibold text-neutral-900">${tableFoodTotal.toLocaleString("en-US")}</p>
          </div>
        </div>
      </div>
      <RestaurantBillingList
        tables={allTables}
        tableOrdersMap={tableOrdersMap}
        tableItemsMap={tableItemsMap}
        unservedMap={tableUnservedMap}
        recentBills={restaurantFeatureUnavailable ? [] : recentTableBills}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Billing & Checkout</h2>
        <p className="page-subtitle">Generate invoices and process checkouts.</p>
      </div>
      <BillingTabsClient
        defaultTab={defaultTab}
        hotelContent={hotelContent}
        restaurantContent={restaurantContent}
      />
    </div>
  );
}
