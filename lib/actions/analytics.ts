"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedAuth } from "@/lib/supabase/cached-auth";
import { redirect } from "next/navigation";

export async function getAnalytics(periodDays = 30) {
  const { role } = await getCachedAuth();
  if (!role || role === "kitchen") redirect("/admin/orders");

  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - periodDays);
  const sinceIso = since.toISOString();

  const [
    roomsRes,
    guestsRes,
    billsRes,
    activeGuestsRes,
  ] = await Promise.all([
    supabase.from("rooms").select("id, room_number, status"),
    supabase
      .from("guests")
      .select("id, room_id, check_in, check_out, rate, billing_mode, hourly_rate, is_active, rooms:room_id(room_number)")
      .gte("check_in", sinceIso),
    supabase
      .from("bills")
      .select("guest_id, total_amount, room_charges, food_charges, payment_mode, payment_status, created_at")
      .gte("created_at", sinceIso),
    supabase
      .from("guests")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  const rooms = roomsRes.data || [];
  const guests = (guestsRes.data || []) as any[];
  const bills = (billsRes.data || []) as any[];
  const totalRooms = rooms.length;
  const occupiedNow = rooms.filter((r: any) => r.status === "occupied").length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedNow / totalRooms) * 100) : 0;

  const now = new Date();
  let totalStayHours = 0;
  let completedStays = 0;
  for (const g of guests) {
    if (g.check_out) {
      const hours = (new Date(g.check_out).getTime() - new Date(g.check_in).getTime()) / 3600000;
      if (hours > 0) {
        totalStayHours += hours;
        completedStays++;
      }
    }
  }
  const avgStayHours = completedStays > 0 ? Math.round(totalStayHours / completedStays) : 0;

  const totalRevenue = bills.reduce((s: number, b: any) => s + Number(b.total_amount || 0), 0);
  const totalRoomRevenue = bills.reduce((s: number, b: any) => s + Number(b.room_charges || 0), 0);
  const totalFoodRevenue = bills.reduce((s: number, b: any) => s + Number(b.food_charges || 0), 0);
  const totalCheckouts = bills.length;

  const revenuePerRoom: Record<string, { roomNumber: number; revenue: number; stays: number }> = {};
  for (const g of guests) {
    const bill = bills.find((b: any) => b.guest_id === g.id);
    if (!bill) continue;
    const roomNum = g.rooms?.room_number ?? g.room_id;
    const key = String(g.room_id);
    if (!revenuePerRoom[key]) revenuePerRoom[key] = { roomNumber: roomNum, revenue: 0, stays: 0 };
    revenuePerRoom[key].revenue += Number(bill.total_amount || 0);
    revenuePerRoom[key].stays++;
  }
  const topRooms = Object.values(revenuePerRoom)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const dailyRevenue: Record<string, number> = {};
  for (const b of bills) {
    const day = new Date(b.created_at).toISOString().slice(0, 10);
    dailyRevenue[day] = (dailyRevenue[day] || 0) + Number(b.total_amount || 0);
  }
  const revenueTimeline = Object.entries(dailyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }));

  const paymentModeBreakdown: Record<string, number> = {};
  for (const b of bills) {
    const mode = b.payment_mode || "Cash";
    paymentModeBreakdown[mode] = (paymentModeBreakdown[mode] || 0) + Number(b.total_amount || 0);
  }

  return {
    periodDays,
    totalRooms,
    occupiedNow,
    occupancyRate,
    activeGuests: activeGuestsRes.count || 0,
    avgStayHours,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalRoomRevenue: Math.round(totalRoomRevenue * 100) / 100,
    totalFoodRevenue: Math.round(totalFoodRevenue * 100) / 100,
    totalCheckouts,
    topRooms,
    revenueTimeline,
    paymentModeBreakdown,
  };
}
