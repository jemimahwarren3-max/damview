import { createClient } from "@/lib/supabase/server";
import { getCachedAuth } from "@/lib/supabase/cached-auth";
import { getOrSetVersionedCache } from "@/lib/cache/redis";
import { redirect } from "next/navigation";
import GuestList from "@/components/admin/GuestList";
import CheckInForm from "@/app/(admin)/admin/guests/CheckInForm";
import { Users, Clock, BedDouble } from "lucide-react";

export default async function GuestsPage() {
  const { role } = await getCachedAuth();
  if (role === "kitchen") redirect("/admin/orders");

  const GUEST_FIELDS =
    "id, room_id, name, guest_code, check_in, people_count, phone, id_proof_name, id_proof_number, other_guest_names, rate, gst_percent, email, gst_number, rooms:room_id ( room_number, type )";

  const { guests, availableRooms, error, roomsError } = await getOrSetVersionedCache({
    domain: "guests",
    key: "admin:guests:list",
    ttlSeconds: 15,
    loader: async () => {
      const supabase = await createClient();
      const [{ data: guests, error }, { data: availableRooms, error: roomsError }] = await Promise.all([
        supabase
          .from("guests")
          .select(GUEST_FIELDS)
          .eq("is_active", true)
          .order("check_in", { ascending: false }),
        supabase
          .from("rooms")
          .select("id, room_number, type, base_price")
          .eq("status", "available")
          .order("room_number", { ascending: true }),
      ]);

      return {
        guests: guests || [],
        availableRooms: availableRooms || [],
        error: error?.message || null,
        roomsError: roomsError?.message || null,
      };
    },
  });

  if (error || roomsError) {
    return (
      <div className="p-8 text-red-500 font-medium">Error loading data.</div>
    );
  }

  const activeGuests = guests || [];
  const totalPeople = activeGuests.reduce(
    (sum, g) => sum + (g.people_count || 1),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">
          Guest Management
        </h2>
        <p className="page-subtitle">
          Check-in new guests and manage current stays.
        </p>
      </div>

      {/* Stats */}
      <div className="kpi-grid grid-cols-3">
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-neutral-100 p-2.5 rounded-xl">
            <Users className="h-5 w-5 text-neutral-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Active Guests
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              {activeGuests.length}
            </p>
          </div>
        </div>
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-blue-100 p-2.5 rounded-xl">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total People
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              {totalPeople}
            </p>
          </div>
        </div>
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-emerald-100 p-2.5 rounded-xl">
            <BedDouble className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Rooms Free
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              {(availableRooms || []).length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200/50">
            <h3 className="text-base font-bold text-neutral-800">
              Current Active Guests
            </h3>
          </div>
          <GuestList
            guests={activeGuests as any}
            availableRooms={(availableRooms || []) as any}
          />
        </div>

        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200/50 bg-neutral-50 border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-800">New Check-In</h3>
          </div>
          <div className="p-5">
            <CheckInForm availableRooms={availableRooms || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
