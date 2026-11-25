"use server";

import { requireAuth } from "@/lib/auth-guard";

export async function getDailyReconciliation(dateStr?: string) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  const target = dateStr || new Date().toISOString().split("T")[0];
  const dayStart = `${target}T00:00:00`;
  const dayEnd = `${target}T23:59:59`;

  const [
    { data: bills },
    { data: restaurantBills },
    { data: checkouts },
    { data: checkins },
  ] = await Promise.all([
    supabase
      .from("bills")
      .select("id, total_amount, amount_paid, outstanding_balance, payment_mode, payment_status, created_at, guest_id")
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd)
      .order("created_at", { ascending: true }),
    supabase
      .from("restaurant_bills")
      .select("id, total_amount, payment_mode, payment_status, created_at")
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd)
      .order("created_at", { ascending: true }),
    supabase
      .from("guests")
      .select("id, name, check_out, room_id, rooms:room_id ( room_number )")
      .eq("is_active", false)
      .gte("check_out", dayStart)
      .lte("check_out", dayEnd),
    supabase
      .from("guests")
      .select("id, name, check_in, room_id, rooms:room_id ( room_number )")
      .gte("check_in", dayStart)
      .lte("check_in", dayEnd),
  ]);

  const hotelBills = bills || [];
  const restBills = restaurantBills || [];

  const byMode = (items: any[], modeField = "payment_mode", amountField = "amount_paid") => {
    const totals: Record<string, number> = { Cash: 0, EcoCash: 0, "Bank Transfer": 0 };
    for (const item of items) {
      const mode = item[modeField] || "Cash";
      const amount = item[amountField] ?? item.total_amount ?? 0;
      if (totals[mode] !== undefined) totals[mode] += amount;
    }
    return totals;
  };

  const hotelByMode = byMode(hotelBills);
  const restByMode = byMode(restBills, "payment_mode", "total_amount");

  const hotelTotal = hotelBills.reduce((s, b) => s + (b.amount_paid ?? b.total_amount ?? 0), 0);
  const restTotal = restBills.reduce((s, b) => s + (b.total_amount ?? 0), 0);
  const outstandingTotal = hotelBills.reduce((s, b) => s + (b.outstanding_balance ?? 0), 0);

  const combined: Record<string, number> = { Cash: 0, EcoCash: 0, "Bank Transfer": 0 };
  for (const mode of Object.keys(combined)) {
    combined[mode] = (hotelByMode[mode] || 0) + (restByMode[mode] || 0);
  }

  return {
    date: target,
    hotel: {
      count: hotelBills.length,
      total: hotelTotal,
      byMode: hotelByMode,
      outstanding: outstandingTotal,
    },
    restaurant: {
      count: restBills.length,
      total: restTotal,
      byMode: restByMode,
    },
    combined: {
      total: hotelTotal + restTotal,
      byMode: combined,
    },
    checkouts: (checkouts || []).length,
    checkins: (checkins || []).length,
  };
}
