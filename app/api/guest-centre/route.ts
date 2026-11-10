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

  const { data: lodgeEnquiry } = await supabase
    .from("lodge_enquiries")
    .select("id, name, phone, status, check_in, guests, block_id, room_id")
    .eq("booking_reference", bookingReference)
    .maybeSingle();

  if (lodgeEnquiry && normalizePhone(lodgeEnquiry.phone) === phone) {
    const { data: block } = lodgeEnquiry.block_id
      ? await supabase.from("room_blocks").select("display_name").eq("id", lodgeEnquiry.block_id).maybeSingle()
      : { data: null };

    const { data: payment } = await supabase
      .from("payment_submissions")
      .select("payment_reference, payment_status, receipt_number")
      .eq("lodge_enquiry_id", lodgeEnquiry.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      type: "lodge",
      name: lodgeEnquiry.name,
      detailLabel: "Room type",
      detailValue: block?.display_name ?? "Not yet assigned",
      checkIn: lodgeEnquiry.check_in,
      guests: lodgeEnquiry.guests,
      status: lodgeEnquiry.status,
      payment: payment
        ? { reference: payment.payment_reference, status: payment.payment_status, receiptNumber: payment.receipt_number }
        : null,
    });
  }

  const { data: eventEnquiry } = await supabase
    .from("event_enquiries")
    .select("id, name, phone, status, proposed_date, expected_guests, event_type")
    .eq("booking_reference", bookingReference)
    .maybeSingle();

  if (eventEnquiry && normalizePhone(eventEnquiry.phone) === phone) {
    const { data: payment } = await supabase
      .from("payment_submissions")
      .select("payment_reference, payment_status, receipt_number")
      .eq("event_enquiry_id", eventEnquiry.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      type: "event",
      name: eventEnquiry.name,
      detailLabel: "Event type",
      detailValue: eventEnquiry.event_type.replace("_", " "),
      checkIn: eventEnquiry.proposed_date,
      guests: eventEnquiry.expected_guests,
      status: eventEnquiry.status,
      payment: payment
        ? { reference: payment.payment_reference, status: payment.payment_status, receiptNumber: payment.receipt_number }
        : null,
    });
  }

  return NextResponse.json({ error: "We couldn't find a booking matching that reference and phone number." }, { status: 404 });
}
