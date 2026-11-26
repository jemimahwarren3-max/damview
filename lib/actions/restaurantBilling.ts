"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { bumpCacheVersions } from "@/lib/cache/redis";

export async function settleTableBill(
  tableId: string,
  foodCharges: number,
  discountAmount: number,
  gstAmount: number,
  totalAmount: number,
  paymentMode: string,
  items: any[] = [],
  billId?: string | null,
) {
  if (
    !Number.isFinite(foodCharges) ||
    !Number.isFinite(discountAmount) ||
    !Number.isFinite(gstAmount) ||
    !Number.isFinite(totalAmount)
  ) return { error: "Invalid amounts. Please enter valid numeric values." };

  if (totalAmount < 0 || foodCharges < 0 || discountAmount < 0 || gstAmount < 0)
    return { error: "Invalid amounts. Charges cannot be negative." };
  if (!["Cash", "EcoCash", "Bank Transfer"].includes(paymentMode))
    return { error: "Invalid payment mode." };

  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  // Server-side guard: block settle if ANY unserved orders exist for this table
  const { count: unservedCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("table_id", tableId)
    .in("status", ["pending", "accepted", "preparing", "prepared"]);

  if (unservedCount && unservedCount > 0)
    return { error: "Cannot settle bill. Pending food orders must be served or cancelled first." };

  if (foodCharges === 0)
    return { error: "Cannot settle bill. No orders have been placed for this table." };

  const settlementCutoff = new Date().toISOString();
  const baseBillPayload = {
    ...(billId ? { id: billId } : {}),
    table_id: tableId,
    food_charges: foodCharges,
    discount_amount: discountAmount,
    gst_amount: gstAmount,
    total_amount: totalAmount,
    payment_mode: paymentMode,
    payment_status: "paid" as const,
  };

  let billError: { message?: string } | null = null;

  if (items.length > 0) {
    const { error } = await supabase.from("restaurant_bills").insert({ ...baseBillPayload, items });
    billError = error;
  } else {
    const { error } = await supabase.from("restaurant_bills").insert(baseBillPayload);
    billError = error;
  }

  if (billError) {
    const msg = (billError.message || "").toLowerCase();
    const itemsColumnMissing = msg.includes("items") && (msg.includes("schema cache") || msg.includes("column") || msg.includes("does not exist"));
    if (itemsColumnMissing) {
      const { error: fallbackError } = await supabase.from("restaurant_bills").insert(baseBillPayload);
      if (fallbackError) return { error: fallbackError.message };
    } else {
      return { error: billError.message || "Failed to create bill" };
    }
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [{ error: updateOrdersError }, { error: tableError }] = await Promise.all([
    supabaseAdmin.from("orders").update({ status: "billed" }).eq("table_id", tableId).lte("created_at", settlementCutoff).neq("status", "billed"),
    supabase.from("restaurant_tables").update({ status: "available" }).eq("id", tableId),
  ]);

  if (updateOrdersError) console.error("Failed to mark orders as billed on table settle:", updateOrdersError);

  if (tableError) console.error("Failed to free table:", tableError);

  revalidatePath("/admin/billing");
  revalidatePath("/admin/tables");
  revalidatePath("/admin/orders");
  await bumpCacheVersions(["billing", "tables", "orders", "history", "dashboard", "reports"]);
  return { success: true };
}
