"use server";

import { requireAuth } from "@/lib/auth-guard";
import { getOrSetVersionedCache, stableCacheKey } from "@/lib/cache/redis";

export async function getDateWiseSalesReport(
  startDate: string,
  endDate: string,
) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager"]);
  return getOrSetVersionedCache({
    domain: "reports",
    key: stableCacheKey("date-wise-sales", { startDate, endDate }),
    ttlSeconds: 20,
    loader: async () => {
      const [billsResult, restBillsResult] = await Promise.all([
        supabase
          .from("bills")
          .select(
            `
              id, created_at, total_amount, room_charges, food_charges,
              extra_charges, discount_amount, gst_amount, payment_mode, payment_status,
              guests!inner ( name, guest_code, rooms:room_id ( room_number ) )
          `,
          )
          .gte("created_at", startDate)
          .lte("created_at", endDate),
        supabase
          .from("restaurant_bills")
          .select(
            `
              id, created_at, total_amount, food_charges,
              discount_amount, gst_amount, payment_mode, payment_status,
              restaurant_tables!inner ( table_number )
          `,
          )
          .gte("created_at", startDate)
          .lte("created_at", endDate)
      ]);

      if (billsResult.error) return { error: billsResult.error.message };
      if (restBillsResult.error) return { error: restBillsResult.error.message };

      const allData: any[] = [];
      if (billsResult.data) {
        allData.push(...billsResult.data.map(b => ({ ...b, source: "hotel" })));
      }
      if (restBillsResult.data) {
        allData.push(...restBillsResult.data.map((b: any) => ({
          ...b,
          source: "restaurant",
          room_charges: 0,
          guests: {
            name: "Restaurant",
            rooms: { room_number: `T-${b.restaurant_tables?.table_number}` }
          }
        })));
      }

      allData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const formatter = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Harare" });
      const formattedData = allData.map((bill) => ({
        ...bill,
        formatted_date: formatter.format(new Date(bill.created_at)),
      }));

      return { data: formattedData };
    },
  });
}

export async function getRoomWiseSalesReport(
  startDate: string,
  endDate: string,
) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager"]);
  return getOrSetVersionedCache({
    domain: "reports",
    key: stableCacheKey("room-wise-sales", { startDate, endDate }),
    ttlSeconds: 20,
    loader: async () => {
      const [billsResult, restBillsResult] = await Promise.all([
        supabase
          .from("bills")
          .select(
            `
              id, created_at, total_amount, room_charges, food_charges,
              extra_charges, gst_amount, payment_mode,
              guests!inner ( name, guest_code, room_id, rooms:room_id ( room_number, type ) )
          `,
          )
          .gte("created_at", startDate)
          .lte("created_at", endDate),
        supabase
          .from("restaurant_bills")
          .select(
            `
              id, created_at, total_amount, food_charges,
              gst_amount, payment_mode,
              restaurant_tables!inner ( id, table_number )
          `,
          )
          .gte("created_at", startDate)
          .lte("created_at", endDate)
      ]);

      if (billsResult.error) return { error: billsResult.error.message };
      if (restBillsResult.error) return { error: restBillsResult.error.message };

      const roomMap: Record<
        string,
        {
          label: string;
          type: string;
          total: number;
          count: number;
          source: string;
        }
      > = {};

      for (const bill of billsResult.data || []) {
        const guest = bill.guests as any;
        const roomNum = guest?.rooms?.room_number || 0;
        const key = `room-${roomNum}`;
        if (!roomMap[key]) {
          roomMap[key] = {
            label: `Room ${roomNum}`,
            type: guest?.rooms?.type || "standard",
            total: 0,
            count: 0,
            source: "Hotel",
          };
        }
        roomMap[key].total += Number(bill.total_amount);
        roomMap[key].count += 1;
      }

      for (const bill of restBillsResult.data || []) {
        const tableNum = (bill.restaurant_tables as any)?.table_number || 0;
        const key = `table-${tableNum}`;
        if (!roomMap[key]) {
          roomMap[key] = {
            label: `Table ${tableNum}`,
            type: "Restaurant",
            total: 0,
            count: 0,
            source: "Restaurant",
          };
        }
        roomMap[key].total += Number(bill.total_amount);
        roomMap[key].count += 1;
      }

      return {
        data: Object.values(roomMap).sort((a, b) => b.total - a.total),
      };
    },
  });
}

export async function getPaymentModeReport(startDate: string, endDate: string) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager"]);
  return getOrSetVersionedCache({
    domain: "reports",
    key: stableCacheKey("payment-mode", { startDate, endDate }),
    ttlSeconds: 20,
    loader: async () => {
      const [billsResult, restBillsResult] = await Promise.all([
        supabase
          .from("bills")
          .select("payment_mode, total_amount, created_at")
          .gte("created_at", startDate)
          .lte("created_at", endDate),
        supabase
          .from("restaurant_bills")
          .select("payment_mode, total_amount, created_at")
          .gte("created_at", startDate)
          .lte("created_at", endDate)
      ]);

      if (billsResult.error) return { error: billsResult.error.message };
      if (restBillsResult.error) return { error: restBillsResult.error.message };

      const allData = [...(billsResult.data || []), ...(restBillsResult.data || [])];

      const modeMap: Record<string, { mode: string; total: number; count: number }> = {};
      for (const bill of allData) {
        const mode = bill.payment_mode || "Other";
        if (!modeMap[mode]) {
          modeMap[mode] = { mode, total: 0, count: 0 };
        }
        modeMap[mode].total += Number(bill.total_amount);
        modeMap[mode].count += 1;
      }

      return { data: Object.values(modeMap).sort((a,b) => b.total - a.total) };
    },
  });
}

export async function getStockConsumptionReport(
  startDate: string,
  endDate: string,
) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager"]);
  return getOrSetVersionedCache({
    domain: "reports",
    key: stableCacheKey("stock-consumption", { startDate, endDate }),
    ttlSeconds: 20,
    loader: async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
            id, created_at,
            order_items (
                quantity, price_snapshot, custom_name,
                food_menu ( id, name, item_code, price )
            )
        `,
        )
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .neq("status", "cancelled");

      if (error) return { error: error.message };

      const itemMap: Record<
        string,
        { name: string; item_code: string; qty_consumed: number; revenue: number }
      > = {};
      for (const order of orders || []) {
        for (const oi of order.order_items || []) {
          const menu = oi.food_menu as any;
          const key = menu?.id || oi.custom_name || "unknown";
          if (!itemMap[key]) {
            itemMap[key] = {
              name: menu?.name || oi.custom_name || "Custom Item",
              item_code: menu?.item_code || "N/A",
              qty_consumed: 0,
              revenue: 0,
            };
          }
          itemMap[key].qty_consumed += oi.quantity;
          itemMap[key].revenue += oi.quantity * Number(oi.price_snapshot);
        }
      }

      return {
        data: Object.values(itemMap).sort((a, b) => b.qty_consumed - a.qty_consumed),
      };
    },
  });
}

export async function getManagerActivityReport(
  startDate: string,
  endDate: string,
) {
  const { supabase } = await requireAuth(["superadmin"]);
  return getOrSetVersionedCache({
    domain: "reports",
    key: stableCacheKey("manager-activity", { startDate, endDate }),
    ttlSeconds: 20,
    loader: async () => {
      const [{ data: logs, error }, { data: users }, { data: manualOrders }] = await Promise.all([
        supabase
          .from("audit_log")
          .select("user_id, action, entity_type, created_at, details")
          .gte("created_at", startDate)
          .lte("created_at", endDate)
          .order("created_at", { ascending: false }),
        supabase.from("users").select("id, email, role"),
        supabase
          .from("orders")
          .select("created_by, id")
          .eq("entry_mode", "manual")
          .not("created_by", "is", null)
          .gte("created_at", startDate)
          .lte("created_at", endDate),
      ]);

      if (error) return { error: error.message };

      const userMap: Record<string, { email: string; role: string }> = {};
      for (const u of users || []) {
        userMap[u.id] = { email: u.email, role: u.role };
      }

      const activityMap: Record<
        string,
        {
          email: string;
          role: string;
          actions: number;
          manual_orders: number;
          room_shifts: number;
        }
      > = {};

      for (const log of logs || []) {
        const uid = log.user_id || "system";
        if (!activityMap[uid]) {
          const user = userMap[uid];
          activityMap[uid] = {
            email: user?.email || "System",
            role: user?.role || "system",
            actions: 0,
            manual_orders: 0,
            room_shifts: 0,
          };
        }
        activityMap[uid].actions += 1;
        if (log.action === "room_shift") activityMap[uid].room_shifts += 1;
      }

      for (const order of manualOrders || []) {
        const uid = order.created_by || "system";
        if (!activityMap[uid]) {
          const user = userMap[uid];
          activityMap[uid] = {
            email: user?.email || "System",
            role: user?.role || "system",
            actions: 0,
            manual_orders: 0,
            room_shifts: 0,
          };
        }
        activityMap[uid].manual_orders += 1;
      }

      return {
        data: Object.values(activityMap).filter((a) => a.email !== "System"),
      };
    },
  });
}

export async function getMonthlySummary(year: number, month: number) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager"]);

  return getOrSetVersionedCache({
    domain: "reports",
    key: stableCacheKey("monthly-summary", { year, month }),
    ttlSeconds: 30,
    loader: async () => {
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

      const [billsResult, restBillsResult] = await Promise.all([
        supabase
          .from("bills")
          .select(
            "total_amount, room_charges, food_charges, extra_charges, gst_amount, discount_amount, payment_mode, created_at",
          )
          .gte("created_at", startDate)
          .lte("created_at", endDate),
        supabase
          .from("restaurant_bills")
          .select(
            "total_amount, food_charges, gst_amount, discount_amount, payment_mode, created_at",
          )
          .gte("created_at", startDate)
          .lte("created_at", endDate)
      ]);

      if (billsResult.error) return { error: billsResult.error.message };
      if (restBillsResult.error) return { error: restBillsResult.error.message };
      
      const allData: any[] = [
         ...(billsResult.data?.map(b => ({...b, source: "hotel", extra_charges: Number(b.extra_charges || 0), room_charges: Number(b.room_charges || 0)})) || []), 
         ...(restBillsResult.data?.map(b => ({...b, source: "restaurant", extra_charges: 0, room_charges: 0})) || [])
      ];

      const summary = {
        total_revenue: 0,
        hotel_revenue: 0,
        restaurant_revenue: 0,
        total_room_charges: 0,
        total_food_charges: 0,
        total_gst: 0,
        total_discounts: 0,
        total_extra_charges: 0,
        total_bills: allData.length,
        by_payment_mode: {} as Record<string, { count: number; amount: number }>,
        daily: [] as { date: string; revenue: number; count: number }[],
      };

      const dailyMap: Record<string, { revenue: number; count: number }> = {};

      for (const bill of allData) {
        summary.total_revenue += Number(bill.total_amount);
        if (bill.source === "hotel") {
            summary.hotel_revenue += Number(bill.total_amount);
        } else {
            summary.restaurant_revenue += Number(bill.total_amount);
        }
        summary.total_room_charges += bill.room_charges;
        summary.total_food_charges += Number(bill.food_charges);
        summary.total_gst += Number(bill.gst_amount);
        summary.total_discounts += Number(bill.discount_amount);
        summary.total_extra_charges += bill.extra_charges;

        const mode = bill.payment_mode || "Other";
        if (!summary.by_payment_mode[mode]) {
          summary.by_payment_mode[mode] = { count: 0, amount: 0 };
        }
        summary.by_payment_mode[mode].count += 1;
        summary.by_payment_mode[mode].amount += Number(bill.total_amount);

        const dateKey = bill.created_at.split("T")[0];
        if (!dailyMap[dateKey]) dailyMap[dateKey] = { revenue: 0, count: 0 };
        dailyMap[dateKey].revenue += Number(bill.total_amount);
        dailyMap[dateKey].count += 1;
      }

      summary.daily = Object.entries(dailyMap)
        .map(([date, val]) => ({ date, ...val }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return { data: summary };
    },
  });
}
