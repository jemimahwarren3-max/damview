"use server";

import { requireAuth } from "@/lib/auth-guard";
import { bumpCacheVersions } from "@/lib/cache/redis";

export async function updateRoomStatus(
  roomId: string,
  status: "available" | "occupied" | "cleaning",
) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  // Edge case: prevent marking room available/cleaning if a guest is still checked in
  if (status === "available" || status === "cleaning") {
    const { count } = await supabase
      .from("guests")
      .select("*", { count: "exact", head: true })
      .eq("room_id", roomId)
      .eq("is_active", true);

    if (count && count > 0) {
      return {
        error: `Cannot set room to "${status}" — a guest is still checked in. Please checkout the guest first.`,
      };
    }
  }

  // Edge case: prevent manually marking room occupied (should only happen via check-in)
  if (status === "occupied") {
    const { data: room } = await supabase
      .from("rooms")
      .select("status")
      .eq("id", roomId)
      .single();
    if (room?.status === "available") {
      return {
        error: 'Rooms should only be set to "occupied" via the check-in process. Use Guests → New Check-In instead.',
      };
    }
  }

  const { error } = await supabase.from("rooms").update({ status }).eq("id", roomId);
  if (error) return { error: error.message };

  await bumpCacheVersions(["rooms", "dashboard", "guests", "billing"]);

  // No revalidatePath — RoomList uses optimistic useState updates
  return { success: true };
}

export async function updateRoomPrice(roomId: string, basePrice: number) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  const { error } = await supabase
    .from("rooms")
    .update({ base_price: basePrice })
    .eq("id", roomId);

  if (error) return { error: error.message };

  await bumpCacheVersions(["rooms", "dashboard", "billing"]);

  // No revalidatePath — RoomList uses optimistic useState updates
  return { success: true };
}

export async function updateRoomDetails(roomId: string, type: string, basePrice: number) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  const { error } = await supabase
    .from("rooms")
    .update({ type: type as any, base_price: basePrice })
    .eq("id", roomId);

  if (error) return { error: error.message };

  await bumpCacheVersions(["rooms", "dashboard", "billing"]);

  // No revalidatePath — RoomList uses optimistic useState updates
  return { success: true };
}
