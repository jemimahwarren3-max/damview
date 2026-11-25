"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ROOM_BLOCKS as FALLBACK_BLOCKS } from "@/lib/data/admin-fallback";
import type { RoomBlock, RoomStatus } from "@/types";

interface RoomRow {
  id: string;
  blockId: string;
  number: string;
  status: RoomStatus;
}

const NEXT_STATUS: Record<"available" | "held" | "maintenance", RoomStatus> = {
  available: "booked", // manual override, e.g. a walk-in paying cash
  held: "available", // staff tap releases a held room early
  maintenance: "available",
};

const FALLBACK_ROOMS: RoomRow[] = FALLBACK_BLOCKS.flatMap((block) =>
  block.roomNumbers.map((number) => ({ id: `${block.id}-${number}`, blockId: block.id, number, status: "available" as RoomStatus }))
);

export default function AdminRoomsPage() {
  const [blocks, setBlocks] = useState<RoomBlock[]>(FALLBACK_BLOCKS);
  const [rooms, setRooms] = useState<RoomRow[]>(FALLBACK_ROOMS);
  const [rateDrafts, setRateDrafts] = useState<Record<string, string>>({});
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    Promise.all([supabase.rpc("release_expired_holds"), supabase.rpc("release_expired_bookings")]).then(() => {
      supabase
        .from("rooms")
        .select("id, block_id, number, status")
        .order("number")
        .then(({ data, error }) => {
          if (error || !data) return;
          setRooms(data.map((row) => ({ id: row.id, blockId: row.block_id, number: row.number, status: row.status as RoomStatus })));
        });
    });

    supabase
      .from("room_blocks")
      .select("id, name, display_name, rate_per_stay, stay_duration_hours")
      .order("id")
      .then(({ data, error }) => {
        if (error || !data) return;
        setBlocks((prev) =>
          data.map((row) => ({
            id: row.id,
            name: row.name,
            displayName: row.display_name,
            ratePerStay: Number(row.rate_per_stay),
            stayDurationHours: row.stay_duration_hours,
            roomNumbers: prev.find((b) => b.id === row.id)?.roomNumbers ?? [],
          }))
        );
      });
  }, []);

  const cycleStatus = async (room: RoomRow) => {
    if (room.status === "booked") return; // use the explicit Check Out action instead
    const next = NEXT_STATUS[room.status];
    setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, status: next } : r)));

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("rooms").update({ status: next }).eq("id", room.id);
  };

  const checkOut = async (room: RoomRow) => {
    setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, status: "available" } : r)));

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase.rpc("check_out_room", { p_room_id: room.id });
    if (error) {
      // migration not applied yet - fall back to a plain status update
      await supabase.from("rooms").update({ status: "available" }).eq("id", room.id);
    }
  };

  const markMaintenance = async (room: RoomRow) => {
    setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, status: "maintenance" } : r)));

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("rooms").update({ status: "maintenance" }).eq("id", room.id);
  };

  const saveRate = async (blockId: string) => {
    const rate = Number(rateDrafts[blockId]);
    if (!rate || rate <= 0) return;

    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, ratePerStay: rate } : b)));

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("room_blocks").update({ rate_per_stay: rate }).eq("id", blockId);
  };

  return (
    <AdminShell title="Rooms">
      {!configured && (
        <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
          Supabase isn&apos;t configured yet, so this is showing sample data only. Changes here
          won&apos;t be saved.
        </div>
      )}

      <p className="mb-6 text-sm text-muted-foreground">
        Tap an available/maintenance room to toggle it. &quot;Held&quot; rooms are holding a spot for a
        guest who&apos;s mid-payment and release automatically if they don&apos;t finish in time - tap one
        to release it early. A &quot;Booked&quot; room shows a Check Out button once the guest leaves -
        tap it to make the room available again. Edit a block&apos;s rate below.
      </p>

      {blocks.map((block) => (
        <div key={block.id} className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-lg text-dv-forest">
              {block.name} &middot; {block.displayName}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={rateDrafts[block.id] ?? block.ratePerStay}
                onChange={(e) => setRateDrafts((prev) => ({ ...prev, [block.id]: e.target.value }))}
                className="w-24 rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
              />
              <span className="text-sm text-muted-foreground">/ {block.stayDurationHours}hr stay</span>
              <button
                type="button"
                onClick={() => saveRate(block.id)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-dv-forest hover:bg-dv-cream"
              >
                Save
              </button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
            {rooms
              .filter((r) => r.blockId === block.id)
              .map((room) =>
                room.status === "booked" ? (
                  <div
                    key={room.id}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4"
                  >
                    <span className="font-serif text-lg text-dv-forest">{room.number}</span>
                    <StatusBadge status={room.status} />
                    <button
                      type="button"
                      onClick={() => checkOut(room)}
                      className="rounded-full bg-dv-forest px-2.5 py-1 text-[0.65rem] font-bold text-dv-ivory hover:bg-dv-leaf"
                    >
                      Check Out
                    </button>
                    <button
                      type="button"
                      onClick={() => markMaintenance(room)}
                      className="text-[0.65rem] font-medium text-muted-foreground underline"
                    >
                      Needs maintenance
                    </button>
                  </div>
                ) : (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => cycleStatus(room)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4"
                  >
                    <span className="font-serif text-lg text-dv-forest">{room.number}</span>
                    <StatusBadge status={room.status} />
                  </button>
                )
              )}
          </div>
        </div>
      ))}
    </AdminShell>
  );
}
