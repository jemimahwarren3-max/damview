"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, BedDouble, Clock3, PartyPopper, DoorOpen } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SAMPLE_LODGE_ENQUIRIES } from "@/lib/data/admin-mock";
import { ROOM_BLOCKS } from "@/lib/data/admin-fallback";
import type { EnquiryStatus, LodgeEnquiry } from "@/types";

const TOTAL_ROOMS = ROOM_BLOCKS.reduce((sum, block) => sum + block.roomNumbers.length, 0);

export default function AdminDashboardPage() {
  const [recentLodge, setRecentLodge] = useState<LodgeEnquiry[]>(SAMPLE_LODGE_ENQUIRIES);
  const [totalEnquiries, setTotalEnquiries] = useState(SAMPLE_LODGE_ENQUIRIES.length);
  const [pending, setPending] = useState(SAMPLE_LODGE_ENQUIRIES.filter((e) => e.status === "new").length);
  const [eventCount, setEventCount] = useState(0);
  const [roomsAvailable, setRoomsAvailable] = useState<number | null>(null);
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from("lodge_enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (error || !data) return;
        setRecentLodge(
          data.map((row) => ({
            id: row.id,
            name: row.name,
            phone: row.phone,
            email: row.email ?? undefined,
            message: row.message ?? undefined,
            status: row.status as EnquiryStatus,
            createdAt: row.created_at,
            blockId: row.block_id ?? undefined,
            checkIn: row.check_in,
            guests: row.guests,
          }))
        );
      });

    Promise.all([
      supabase.from("lodge_enquiries").select("status"),
      supabase.from("activity_enquiries").select("status"),
      supabase.from("gym_enquiries").select("status"),
      supabase.from("event_enquiries").select("status"),
    ]).then(([lodge, activity, gym, event]) => {
      const all = [...(lodge.data ?? []), ...(activity.data ?? []), ...(gym.data ?? [])];
      setTotalEnquiries(all.length);
      setPending(all.filter((e) => e.status === "new").length);
      setEventCount(event.data?.length ?? 0);
    });

    Promise.all([supabase.rpc("release_expired_holds"), supabase.rpc("release_expired_bookings")]).then(() => {
      supabase
        .from("rooms")
        .select("status")
        .then(({ data }) => {
          if (!data) return;
          setRoomsAvailable(data.filter((r) => r.status === "available").length);
        });
    });
  }, []);

  const stats = [
    { label: "Total enquiries", value: totalEnquiries, icon: CalendarCheck },
    { label: "Pending review", value: pending, icon: Clock3 },
    { label: "Rooms available now", value: roomsAvailable ?? TOTAL_ROOMS, icon: DoorOpen },
    { label: "Rooms (total)", value: TOTAL_ROOMS, icon: BedDouble },
    { label: "Event enquiries", value: eventCount, icon: PartyPopper },
  ];

  return (
    <AdminShell title="Dashboard">
      {!configured && (
        <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
          Supabase isn&apos;t configured yet, so this is showing sample data only.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-border bg-background p-5">
            <Icon className="text-dv-pool" size={20} />
            <span className="mt-3 block font-serif text-2xl text-dv-forest">{value}</span>
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-background p-5">
        <h2 className="font-serif text-lg text-dv-forest">Recent lodge enquiries</h2>
        <div className="mt-4 flex flex-col divide-y divide-border">
          {recentLodge.length === 0 && (
            <p className="py-3 text-sm text-muted-foreground">No lodge enquiries yet.</p>
          )}
          {recentLodge.map((enquiry) => (
            <div key={enquiry.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-dv-black">{enquiry.name}</p>
                <p className="text-sm text-muted-foreground">{enquiry.checkIn} &middot; {enquiry.guests} guests</p>
              </div>
              <StatusBadge status={enquiry.status === "new" ? "pending" : enquiry.status === "contacted" ? "pending" : "confirmed"} label={enquiry.status} />
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
