import { createClient } from "@/lib/supabase/server";
import { getOrSetVersionedCache } from "@/lib/cache/redis";
import { BedDouble, CheckCircle, Loader } from "lucide-react";
import RoomList from "@/app/(admin)/admin/rooms/RoomList";

export default async function SuperadminRoomsPage() {
  const { rooms, error } = await getOrSetVersionedCache({
    domain: "rooms",
    key: "superadmin:rooms:list",
    ttlSeconds: 30,
    loader: async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("rooms")
        .select("id, room_number, type, status, base_price, created_at")
        .order("room_number", { ascending: true });
      return { rooms: data || [], error: error?.message || null };
    },
  });

  if (error)
    return <div className="p-8 text-red-500">Error: {error}</div>;

  const allRooms = rooms || [];
  const available = allRooms.filter((r) => r.status === "available").length;
  const occupied = allRooms.filter((r) => r.status === "occupied").length;
  const cleaning = allRooms.filter((r) => r.status === "cleaning").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">
          Rooms Overview
        </h2>
        <p className="page-subtitle">
          Manage and monitor all rooms across the hotel.
        </p>
      </div>

      <div className="kpi-grid grid-cols-3">
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-emerald-100 p-2.5 rounded-xl">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Available
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              {available}
            </p>
          </div>
        </div>
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-neutral-100 p-2.5 rounded-xl">
            <BedDouble className="h-5 w-5 text-neutral-900" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Occupied
            </p>
            <p className="text-2xl font-semibold text-neutral-900">{occupied}</p>
          </div>
        </div>
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-amber-100 p-2.5 rounded-xl">
            <Loader className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Cleaning
            </p>
            <p className="text-2xl font-semibold text-neutral-900">{cleaning}</p>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <RoomList initialRooms={allRooms} />
      </div>
    </div>
  );
}
