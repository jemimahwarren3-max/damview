import { NextResponse } from "next/server";
import { initializeSuperadmin } from "@/lib/actions/setup";
import { safeCompare } from "@/lib/security";
import { resolveAppOrigin } from "@/lib/supabase/utils";

// GET /admin/setup — protected in production by SETUP_SECRET_KEY
export async function GET(request: Request) {
  const isDevMode = process.env.NODE_ENV === "development";
  const setupSecret = process.env.SETUP_SECRET_KEY;

  if (!isDevMode) {
    const { searchParams } = new URL(request.url);
    const providedSecret = searchParams.get("secret");
    if (!setupSecret || !providedSecret || !safeCompare(providedSecret, setupSecret)) {
      return NextResponse.json(
        { error: "Forbidden: Invalid or missing setup secret." },
        { status: 403 },
      );
    }
  }

  const result = await initializeSuperadmin();

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/admin/login?setup=success", resolveAppOrigin(request)));
}
