import { NextRequest, NextResponse } from "next/server";
import { checkInGuest } from "@/lib/actions/guests";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fd = new FormData();
    for (const [k, v] of Object.entries(body)) {
      fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
    }
    const result = await checkInGuest(fd);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
