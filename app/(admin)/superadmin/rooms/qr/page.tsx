import { createClient } from "@/lib/supabase/server";
import { getCachedAuth } from "@/lib/supabase/cached-auth";
import { redirect } from "next/navigation";
import QRGenerator from "@/app/(admin)/admin/rooms/qr/QRGenerator";


export default async function SuperadminQRCodesPage() {
  const { role } = await getCachedAuth();
  if (role === "kitchen") redirect("/admin/orders");

  const supabase = await createClient();

  const [{ data: rooms, error }, { data: tables }] = await Promise.all([
    supabase
      .from("rooms")
      .select("*")
      .order("room_number", { ascending: true }),
    supabase
      .from("restaurant_tables")
      .select("id, table_number, capacity, status")
      .order("table_number", { ascending: true }),
  ]);

  if (error) {
    return <div>Error loading rooms: {error.message}</div>;
  }

  return <QRGenerator rooms={rooms || []} tables={tables || []} />;
}
