import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Payments aren't configured yet." }, { status: 503 });
  }

  const { data: payment, error } = await supabase
    .from("payment_submissions")
    .select("*")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (error || !payment) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }

  // Lazy expiry: nothing runs on a schedule, so we check the deadline whenever
  // the record is read and persist the transition if it's overdue.
  let status = payment.payment_status;
  if (status === "AWAITING_PAYMENT" && new Date(payment.payment_deadline) < new Date()) {
    status = "EXPIRED";
    await supabase.from("payment_submissions").update({ payment_status: "EXPIRED" }).eq("id", payment.id);
    await supabase.from("payment_audit_log").insert({
      payment_id: payment.id,
      previous_status: payment.payment_status,
      new_status: "EXPIRED",
      action: "expired",
    });
  }

  let detail: { label: string; value: string } | null = null;
  if (payment.enquiry_type === "lodge" && payment.lodge_enquiry_id) {
    const { data: enquiry } = await supabase
      .from("lodge_enquiries")
      .select("check_in, guests, block_id")
      .eq("id", payment.lodge_enquiry_id)
      .maybeSingle();
    if (enquiry) {
      const { data: block } = enquiry.block_id
        ? await supabase.from("room_blocks").select("display_name").eq("id", enquiry.block_id).maybeSingle()
        : { data: null };
      detail = {
        label: "Accommodation",
        value: `${block?.display_name ?? "Room"} · ${enquiry.check_in} · ${enquiry.guests} guests`,
      };
    }
  } else if (payment.enquiry_type === "event" && payment.event_enquiry_id) {
    const { data: enquiry } = await supabase
      .from("event_enquiries")
      .select("event_type, proposed_date, expected_guests")
      .eq("id", payment.event_enquiry_id)
      .maybeSingle();
    if (enquiry) {
      detail = {
        label: "Event",
        value: `${enquiry.event_type.replace("_", " ")} · ${enquiry.proposed_date} · ${enquiry.expected_guests} guests`,
      };
    }
  }

  return NextResponse.json({
    paymentReference: payment.payment_reference,
    customerName: payment.customer_name,
    expectedAmount: payment.expected_amount,
    currency: payment.currency,
    amountClaimed: payment.amount_claimed,
    paymentStatus: status,
    paymentDeadline: payment.payment_deadline,
    submittedAt: payment.submitted_at,
    verifiedAt: payment.verified_at,
    rejectionReason: payment.rejection_reason,
    receiptNumber: payment.receipt_number,
    ecocashTransactionReference: payment.ecocash_transaction_reference,
    detail,
  });
}
