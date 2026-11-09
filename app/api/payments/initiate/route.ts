import { NextRequest, NextResponse } from "next/server";
import { initiateWebPayment } from "@/lib/paynow";

/**
 * POST { reference: string, items: { description: string, amount: number }[] }
 *
 * Not functional until Paynow credentials are configured (see docs/paynow.md).
 * Also has nothing real to attach a payment to yet — bookings/invoices live
 * only as mock data (lib/data/*.ts) until Stage 10's backend is wired up.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.reference || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "reference and items are required" }, { status: 400 });
  }

  const origin = request.nextUrl.origin;

  try {
    const result = await initiateWebPayment({
      reference: body.reference,
      items: body.items,
      resultUrl: `${origin}/api/payments/webhook`,
      returnUrl: `${origin}/accommodation?payment=complete`,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Payment could not be started" }, { status: 502 });
    }

    return NextResponse.json({ redirectUrl: result.redirectUrl, pollUrl: result.pollUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment could not be started" },
      { status: 503 }
    );
  }
}
