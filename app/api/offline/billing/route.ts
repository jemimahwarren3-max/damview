import { NextRequest, NextResponse } from "next/server";
import { processCheckout } from "@/lib/actions/billing";

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const result = await processCheckout(
      b.guestId,
      b.roomId,
      b.roomCharges,
      b.foodCharges,
      b.discountAmount,
      b.extraCharges,
      b.extraChargesDetails || [],
      b.gstAmount,
      b.totalAmount,
      b.paymentMode,
    );
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
