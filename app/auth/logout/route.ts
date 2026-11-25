import { createClient } from "@/lib/supabase/server";
import { resolveAppOrigin } from "@/lib/supabase/utils";
import { NextResponse } from "next/server";

async function performLogout(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const appOrigin = resolveAppOrigin(request);
  const redirectUrl = new URL("/admin/login", appOrigin);
  const requestUrl = new URL(request.url);
  const reason = requestUrl.searchParams.get("reason");

  if (reason) {
    redirectUrl.searchParams.set("reason", reason);
  }

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.delete("x-user-role");
  return response;
}

export async function GET(request: Request) {
  return performLogout(request);
}

export async function POST(request: Request) {
  return performLogout(request);
}
