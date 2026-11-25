import { createClient } from "@/lib/supabase/server";
import { getCachedAuth } from "@/lib/supabase/cached-auth";
import { redirect } from "next/navigation";
import ReservationList from "./ReservationList";

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; date?: string; search?: string }>;
}) {
  const { user, role } = await getCachedAuth();
  if (!user) redirect("/admin/login");

  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("reservations")
    .select("*, rooms:room_id ( room_number, type, label )")
    .order("check_in_date", { ascending: true });

  const statusFilter = params.status || "confirmed";
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }
  if (params.date) {
    query = query.eq("check_in_date", params.date);
  }
  if (params.search) {
    query = query.or(
      `guest_name.ilike.%${params.search}%,guest_phone.ilike.%${params.search}%`,
    );
  }

  const [{ data: reservations }, { data: rooms }] = await Promise.all([
    query,
    supabase
      .from("rooms")
      .select("id, room_number, type, label, base_price, status, max_occupancy")
      .order("room_number"),
  ]);

  return (
    <div>
      <div className="page-header">
        <h1 className="text-2xl font-bold text-neutral-900">Reservations</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Manage advance bookings and walk-in reservations
        </p>
      </div>
      <ReservationList
        reservations={(reservations as any[]) || []}
        rooms={(rooms as any[]) || []}
        currentStatus={statusFilter}
        searchQuery={params.search || ""}
        role={role}
      />
    </div>
  );
}
