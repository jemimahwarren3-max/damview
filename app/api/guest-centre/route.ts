import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { normalizePhone } from "@/lib/phone";

/**
 * Lets a guest check their booking without needing their original payment
 * link - requires BOTH the booking reference and the phone number used to
 * book, since the reference alone isn't a secret (it's shown/read aloud to
 * guests). Returns only what a guest needs to see, never the full row.
 */
export async function POST(request: Request) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "The guest centre isn't configured yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const bookingReference = String(body?.bookingReference ?? "").trim().toUpperCase();
  const phone = normalizePhone(String(body?.phone ?? ""));

  if (!bookingReference || !phone) {
    return NextResponse.json({ error: "Please enter your booking reference and phone number." }, { status: 400 });
  }

  const { data: enquiry } = await supabase
    .from("lodge_enquiries")
    .select("id, name, phone, status, check_in, guests, block_id, room_id")
    .eq("booking_reference", bookingReference)
    .maybeSingle();

  if (!enquiry || normalizePhone(enquiry.phone) !== phone) {
    return NextResponse.json({ error: "We couldn't find a booking matching that reference and phone number." }, { status: 404 });
  }

  const { data: block } = enquiry.block_id
    ? await supabase.from("room_blocks").select("display_name").eq("id", enquiry.block_id).maybeSingle()
    : { data: null };

  const { data: payment } = await supabase
    .from("payment_submissions")
    .select("payment_reference, payment_status, receipt_number")
    .eq("lodge_enquiry_id", enquiry.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    name: enquiry.name,
    blockName: block?.display_name ?? null,
    checkIn: enquiry.check_in,
    guests: enquiry.guests,
    status: enquiry.status,
    roomAssigned: Boolean(enquiry.room_id),
    payment: payment
      ? { reference: payment.payment_reference, status: payment.payment_status, receiptNumber: payment.receipt_number }
      : null,
  });
}
