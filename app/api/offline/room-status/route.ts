import { NextRequest, NextResponse } from "next/server";
import { updateRoomStatus } from "@/lib/actions/rooms";

export async function POST(req: NextRequest) {
  try {
    const { roomId, status } = await req.json();
    const result = await updateRoomStatus(roomId, status);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
