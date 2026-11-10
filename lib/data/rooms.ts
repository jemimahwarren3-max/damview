import type { RoomBlock } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ROOM_BLOCKS as FALLBACK_ROOM_BLOCKS } from "@/lib/data/admin-fallback";

export const ROOM_IMAGE = "/images/accommodation/real/room-3.jpg";

export async function getRoomBlocks(): Promise<RoomBlock[]> {
  "use cache";
  const supabase = getSupabaseClient();
  if (!supabase) return FALLBACK_ROOM_BLOCKS;

  const { data: blocks, error: blocksError } = await supabase
    .from("room_blocks")
    .select("id, name, display_name, rate_per_stay, stay_duration_hours")
    .order("id");
  if (blocksError) return FALLBACK_ROOM_BLOCKS;

  const { data: rooms, error: roomsError } = await supabase.from("rooms").select("block_id, number").order("number");
  if (roomsError) return FALLBACK_ROOM_BLOCKS;

  return blocks.map((block) => ({
    id: block.id,
    name: block.name,
    displayName: block.display_name,
    ratePerStay: Number(block.rate_per_stay),
    stayDurationHours: block.stay_duration_hours,
    roomNumbers: rooms.filter((r) => r.block_id === block.id).map((r) => r.number),
  }));
}

export async function getRoomBlockById(id: string): Promise<RoomBlock | undefined> {
  "use cache";
  const blocks = await getRoomBlocks();
  return blocks.find((block) => block.id === id);
}
