"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { bumpCacheVersions } from "@/lib/cache/redis";

export async function extendStay(
  guestId: string,
  newRate?: number,
  notes?: string,
) {
  const { user, supabase } = await requireAuth(["admin", "superadmin", "manager"]);

  const { data: guest, error: fetchErr } = await supabase
    .from("guests")
    .select("id, name, room_id, rate, is_active, rooms:room_id ( room_number )")
    .eq("id", guestId)
    .eq("is_active", true)
    .single();

  if (fetchErr || !guest)
    return { error: "Guest not found or already checked out." };

  const updates: Record<string, any> = {};
  if (newRate !== undefined && newRate >= 0) {
    updates.rate = newRate;
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateErr } = await supabase
      .from("guests")
      .update(updates)
      .eq("id", guestId);
    if (updateErr) return { error: updateErr.message };
  }

  await supabase.from("audit_log").insert({
    user_id: user?.id || null,
    action: "extend_stay",
    entity_type: "guest",
    entity_id: guestId,
    details: {
      guest_name: (guest as any).name,
      room_number: (guest as any).rooms?.room_number,
      new_rate: newRate,
      notes: notes || null,
    },
  });

  revalidatePath("/admin/billing");
  revalidatePath("/admin/guests");
  await bumpCacheVersions(["guests", "billing", "dashboard"]);
  return { success: true };
}

export async function processRefund(
  billId: string,
  refundAmount: number,
  reason: string,
) {
  if (refundAmount <= 0) return { error: "Refund amount must be positive." };
  if (!reason.trim()) return { error: "Refund reason is required." };

  const { user, supabase } = await requireAuth(["admin", "superadmin"]);

  const { data: bill, error: fetchErr } = await supabase
    .from("bills")
    .select("id, guest_id, total_amount, amount_paid, outstanding_balance, payment_status")
    .eq("id", billId)
    .single();

  if (fetchErr || !bill) return { error: "Bill not found." };

  const currentPaid = bill.amount_paid ?? bill.total_amount;
  if (refundAmount > currentPaid)
    return { error: `Cannot refund more than amount paid ($${currentPaid.toFixed(2)}).` };

  const newPaid = Math.round((currentPaid - refundAmount) * 100) / 100;
  const newOutstanding = Math.round((bill.total_amount - newPaid) * 100) / 100;

  const { error: updateErr } = await supabase
    .from("bills")
    .update({
      amount_paid: newPaid,
      outstanding_balance: newOutstanding,
      payment_status: newPaid <= 0 ? "pending" : newOutstanding > 0 ? "partial" : "paid",
    })
    .eq("id", billId);

  if (updateErr) return { error: updateErr.message };

  await supabase.from("audit_log").insert({
    user_id: user?.id || null,
    action: "refund",
    entity_type: "bill",
    entity_id: billId,
    details: {
      refund_amount: refundAmount,
      reason,
      new_amount_paid: newPaid,
      new_outstanding: newOutstanding,
    },
  });

  revalidatePath("/admin/billing");
  revalidatePath("/admin/history");
  await bumpCacheVersions(["billing", "history", "reports", "dashboard"]);
  return { success: true };
}

export async function recordAdditionalPayment(
  billId: string,
  amount: number,
  paymentMode: string,
) {
  if (amount <= 0) return { error: "Payment amount must be positive." };
  if (!["Cash", "EcoCash", "Bank Transfer"].includes(paymentMode))
    return { error: "Invalid payment mode." };

  const { user, supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  const { data: bill, error: fetchErr } = await supabase
    .from("bills")
    .select("id, guest_id, total_amount, amount_paid, outstanding_balance")
    .eq("id", billId)
    .single();

  if (fetchErr || !bill) return { error: "Bill not found." };

  const currentPaid = bill.amount_paid ?? 0;
  const newPaid = Math.min(
    Math.round((currentPaid + amount) * 100) / 100,
    bill.total_amount,
  );
  const newOutstanding = Math.round((bill.total_amount - newPaid) * 100) / 100;

  const { error: updateErr } = await supabase
    .from("bills")
    .update({
      amount_paid: newPaid,
      outstanding_balance: newOutstanding,
      payment_status: newOutstanding <= 0 ? "paid" : "partial",
      payment_mode: paymentMode,
    })
    .eq("id", billId);

  if (updateErr) return { error: updateErr.message };

  await supabase.from("audit_log").insert({
    user_id: user?.id || null,
    action: "additional_payment",
    entity_type: "bill",
    entity_id: billId,
    details: {
      amount,
      payment_mode: paymentMode,
      new_total_paid: newPaid,
      remaining: newOutstanding,
    },
  });

  revalidatePath("/admin/billing");
  revalidatePath("/admin/history");
  await bumpCacheVersions(["billing", "history", "reports", "dashboard"]);
  return { success: true };
}
