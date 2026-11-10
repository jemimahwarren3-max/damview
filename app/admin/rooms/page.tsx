"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ROOM_BLOCKS } from "@/lib/data/admin-fallback";
import type { RoomStatus } from "@/types";

interface RoomRow {
  id: string;
  blockId: string;
  number: string;
  status: RoomStatus;
}

const NEXT_STATUS: Record<RoomStatus, RoomStatus> = {
  available: "booked",
  booked: "maintenance",
  maintenance: "available",
};

const FALLBACK_ROOMS: RoomRow[] = ROOM_BLOCKS.flatMap((block) =>
  block.roomNumbers.map((number) => ({ id: `${block.id}-${number}`, blockId: block.id, number, status: "available" as RoomStatus }))
);

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<RoomRow[]>(FALLBACK_ROOMS);
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from("rooms")
      .select("id, block_id, number, status")
      .order("number")
      .then(({ data, error }) => {
        if (error || !data) return;
        setRooms(data.map((row) => ({ id: row.id, blockId: row.block_id, number: row.number, status: row.status as RoomStatus })));
      });
  }, []);

  const cycleStatus = async (room: RoomRow) => {
    const next = NEXT_STATUS[room.status];
    setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, status: next } : r)));

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("rooms").update({ status: next }).eq("id", room.id);
  };

  return (
    <AdminShell title="Rooms">
      {!configured && (
        <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
          Supabase isn&apos;t configured yet, so this is showing sample data only. Status changes
          here won&apos;t be saved.
        </div>
      )}

      <p className="mb-6 text-sm text-muted-foreground">Tap a room to cycle its status.</p>

      {ROOM_BLOCKS.map((block) => (
        <div key={block.id} className="mb-8">
          <h2 className="font-serif text-lg text-dv-forest">{block.name}</h2>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
            {rooms
              .filter((r) => r.blockId === block.id)
              .map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => cycleStatus(room)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4"
                >
                  <span className="font-serif text-lg text-dv-forest">{room.number}</span>
                  <StatusBadge status={room.status} />
                </button>
              ))}
          </div>
        </div>
      ))}
    </AdminShell>
  );
}
