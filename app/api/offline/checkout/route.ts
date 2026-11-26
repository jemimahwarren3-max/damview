import { NextRequest, NextResponse } from "next/server";
import { checkoutGuest } from "@/lib/actions/guests";

export async function POST(req: NextRequest) {
  try {
    const { guestId, roomId } = await req.json();
    const result = await checkoutGuest(guestId, roomId);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
