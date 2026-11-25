import { redirect } from "next/navigation";
import { getCachedAuth } from "@/lib/supabase/cached-auth";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = await getCachedAuth();

  if (!user || !role || role === "disabled") {
    redirect("/admin/login");
  }

  if (role !== "superadmin") {
    redirect("/admin/dashboard");
  }

  return <>{children}</>;
}
