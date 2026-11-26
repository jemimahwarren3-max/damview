import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { safeCompare } from "@/lib/security";

/**
 * Vercel Cron Job: Daily data cleanup
 * - Deletes orders older than 7 days (order_items cascade automatically)
 * - Deletes bills, orders, and guests older than 1 year
 *
 * Works on Supabase free tier (no pg_cron needed).
 * Scheduled via vercel.json: daily at 2:00 AM UTC.
 */
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (or has the correct secret)
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || !safeCompare(authHeader, expectedAuth)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing Supabase configuration" },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const results: Record<string, string> = {};

  // ── 1. (Removed 7-day order deletion to preserve history for 1 year) ──
  results.orders_7day = "skipped";

  // ── 2. Delete all data older than 1 year ────────────────────────────
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const cutoff = oneYearAgo.toISOString();

  // Delete in FK order: bills → restaurant_bills → orders → guests
  const { error: billErr } = await supabase
    .from("bills")
    .delete()
    .lt("created_at", cutoff);
  results.bills_1year = billErr ? billErr.message : "ok";

  const { error: rBillErr } = await supabase
    .from("restaurant_bills")
    .delete()
    .lt("created_at", cutoff);
  results.restaurant_bills_1year = rBillErr ? rBillErr.message : "ok";

  const { error: oldOrderErr } = await supabase
    .from("orders")
    .delete()
    .lt("created_at", cutoff);
  results.orders_1year = oldOrderErr ? oldOrderErr.message : "ok";

  const { error: guestErr } = await supabase
    .from("guests")
    .delete()
    .lt("created_at", cutoff);
  results.guests_1year = guestErr ? guestErr.message : "ok";

  const allOk = Object.values(results).every((v) => v === "ok");

  return NextResponse.json(
    { success: allOk, results, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 207 },
  );
}
