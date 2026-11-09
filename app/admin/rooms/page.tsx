"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ROOM_BLOCKS } from "@/lib/data/rooms";
import type { RoomStatus } from "@/types";

const ALL_ROOMS = ROOM_BLOCKS.flatMap((block) =>
  block.roomNumbers.map((number) => ({ id: number, block: block.name }))
);

const NEXT_STATUS: Record<RoomStatus, RoomStatus> = {
  available: "booked",
  booked: "maintenance",
  maintenance: "available",
};

export default function AdminRoomsPage() {
  const [statuses, setStatuses] = useState<Record<string, RoomStatus>>(
    Object.fromEntries(ALL_ROOMS.map((room) => [room.id, "available"]))
  );

  return (
    <AdminShell title="Rooms">
      <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
        Tap a room to cycle its status — local to your browser only, not saved yet.
      </div>

      {ROOM_BLOCKS.map((block) => (
        <div key={block.id} className="mb-8">
          <h2 className="font-serif text-lg text-dv-forest">{block.name}</h2>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
            {block.roomNumbers.map((number) => (
              <button
                key={number}
                type="button"
                onClick={() =>
                  setStatuses((prev) => ({ ...prev, [number]: NEXT_STATUS[prev[number]] }))
                }
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4"
              >
                <span className="font-serif text-lg text-dv-forest">{number}</span>
                <StatusBadge status={statuses[number]} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </AdminShell>
  );
}
