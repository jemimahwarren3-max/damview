import { NextRequest, NextResponse } from "next/server";
import { checkPaymentStatus } from "@/lib/paynow";

/**
 * Paynow's resultUrl callback. Deliberately does NOT trust the hash on the
 * POST body — Paynow's docs describe two different hash-field formats
 * depending on integration type, and getting payment-verification signature
 * checking wrong is a real security hole. Instead this re-verifies status by
 * polling Paynow directly with the pollUrl Paynow itself sent us when the
 * payment was created — a server-to-server call Paynow authenticates by URL,
 * not by trusting anything the webhook body claims.
 *
 * Currently just confirms status — there is no bookings/invoices table yet
 * to update (Stage 10). Once Supabase is wired up, a paid webhook should
 * mark the matching booking/invoice as paid here.
 */
export async function POST(request: NextRequest) {
  const body = await request.formData();
  const pollUrl = body.get("pollurl");

  if (typeof pollUrl !== "string") {
    return NextResponse.json({ error: "Missing pollurl" }, { status: 400 });
  }

  try {
    const status = await checkPaymentStatus(pollUrl);

    if (status.paid()) {
      // TODO (Stage 10): look up the booking/invoice by status.reference and mark it paid.
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not verify payment status" },
      { status: 503 }
    );
  }
}
