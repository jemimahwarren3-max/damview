"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { bumpCacheVersions } from "@/lib/cache/redis";

export async function processCheckout(
  guestId: string,
  roomId: string,
  roomCharges: number,
  foodCharges: number,
  discountAmount: number,
  extraCharges: number,
  extraChargesDetails: { name: string; amount: number }[],
  gstAmount: number,
  totalAmount: number,
  paymentMode: string,
  amountPaid?: number,
) {
  if (totalAmount < 0 || roomCharges < 0 || foodCharges < 0)
    return { error: "Invalid amounts. Charges cannot be negative." };
  if (roomCharges === 0)
    return { error: "Room charges cannot be zero. Please verify the billing calculation." };
  if (!["Cash", "EcoCash", "Bank Transfer", "Pending", ""].includes(paymentMode))
    return { error: "Invalid payment mode." };
  const paid = amountPaid !== undefined ? Math.min(amountPaid, totalAmount) : totalAmount;
  if (paid < 0) return { error: "Amount paid cannot be negative." };
  const outstandingBalance = Math.round((totalAmount - paid) * 100) / 100;

  const { supabase, user } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  // Server-side guard: block checkout if there are unserved orders for this room
  const { count: unservedCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("room_id", roomId)
    .in("status", ["pending", "accepted", "preparing", "prepared"]);

  if (unservedCount && unservedCount > 0)
    return { error: "Cannot checkout. There are pending food orders that must be served or cancelled first." };

  const { count: existingBills } = await supabase
    .from("bills")
    .select("*", { count: "exact", head: true })
    .eq("guest_id", guestId);

  if (existingBills && existingBills > 0)
    return { error: "A bill already exists for this guest. This might be a duplicate submission." };


  const { data: updatedGuest, error: guestError } = await supabase
    .from("guests")
    .update({ is_active: false, check_out: new Date().toISOString() })
    .eq("id", guestId)
    .eq("room_id", roomId)
    .eq("is_active", true)
    .select()
    .maybeSingle();

  if (guestError) return { error: guestError.message };
  if (!updatedGuest)
    return { error: "This guest has already been checked out. Refresh the page." };

  const paymentStatus = outstandingBalance > 0 ? "partial" : "paid";

  const { error: billError } = await supabase.from("bills").insert({
    guest_id: guestId,
    room_charges: roomCharges,
    food_charges: foodCharges,
    discount_amount: discountAmount,
    extra_charges: extraCharges,
    extra_charges_details: extraChargesDetails,
    gst_amount: gstAmount,
    total_amount: totalAmount,
    amount_paid: paid,
    outstanding_balance: outstandingBalance,
    payment_status: paymentStatus,
    payment_mode: paymentMode || "Cash",
  });

  if (billError) {
    await supabase.from("guests").update({ is_active: true, check_out: null }).eq("id", guestId);
    return { error: billError.message };
  }

  await supabase.from("audit_log").insert({
    user_id: user.id,
    action: "checkout",
    entity_type: "guest",
    entity_id: guestId,
    details: {
      guest_name: (updatedGuest as any).name,
      room_id: roomId,
      room_charges: roomCharges,
      food_charges: foodCharges,
      total_amount: totalAmount,
      amount_paid: paid,
      outstanding_balance: outstandingBalance,
      payment_mode: paymentMode,
      payment_status: paymentStatus,
    },
  });

  const [{ error: roomError }, { error: cancelOrdersError }] = await Promise.all([
    supabase.from("rooms").update({ status: "cleaning" }).eq("id", roomId),
    supabase.from("orders").update({ status: "cancelled" }).eq("room_id", roomId).in("status", ["pending", "accepted", "preparing"]),
  ]);

  if (roomError) return { error: roomError.message };
  if (cancelOrdersError)
    console.error("Failed to cancel pending orders on checkout:", cancelOrdersError);

  revalidatePath("/admin/billing");
  revalidatePath("/admin/guests");
  revalidatePath("/admin/rooms");
  await bumpCacheVersions(["billing", "guests", "rooms", "orders", "history", "dashboard", "reports"]);
  return { success: true };
}
