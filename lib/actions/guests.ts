"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { bumpCacheVersions } from "@/lib/cache/redis";

export async function checkInGuest(formData: FormData) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  const roomId = formData.get("room_id") as string;
  const name = formData.get("name") as string;
  const otherGuestNamesRaw = formData.get("other_guest_names") as string;
  const otherGuestNames = JSON.parse(otherGuestNamesRaw || "[]") as string[];
  const phone = formData.get("phone") as string;
  const idProofName = formData.get("id_proof_name") as string;
  const idProofNumber = formData.get("id_proof_number") as string;
  const peopleCount = parseInt(formData.get("people_count") as string, 10);
  const rate = parseFloat(formData.get("rate") as string);
  const gstPercent = parseFloat(formData.get("gst_percent") as string);
  const gstNumber = (formData.get("gst_number") as string || "").trim() || null;
  const email = (formData.get("email") as string || "").trim() || null;

  if (isNaN(rate) || rate < 0 || rate > 100000)
    return { error: "Invalid rate. Must be between $0 and $100,000." };
  if (isNaN(gstPercent) || gstPercent < 0 || gstPercent > 100)
    return { error: "Invalid tax percentage. Must be between 0% and 100%." };
  if (isNaN(peopleCount) || peopleCount < 1 || peopleCount > 50)
    return { error: "Invalid people count. Must be between 1 and 50." };
  if (!name || name.trim().length < 2)
    return { error: "Guest name must be at least 2 characters." };

  const phoneDigits = phone.replace(/\D/g, "");
  if (!phoneDigits || phoneDigits.length < 7 || phoneDigits.length > 15)
    return { error: "Phone number must be between 7 and 15 digits." };

  const trimmedIdNumber = idProofNumber.trim();
  if (!trimmedIdNumber || trimmedIdNumber.length < 4)
    return { error: "ID number must be at least 4 characters." };

  const { count: existingGuests } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true })
    .eq("room_id", roomId)
    .eq("is_active", true);

  if (existingGuests && existingGuests > 0)
    return { error: "This room already has an active guest. Checkout the existing guest first." };

  const { data: reservedRoom, error: roomReserveError } = await supabase
    .from("rooms")
    .update({ status: "occupied" })
    .eq("id", roomId)
    .eq("status", "available")
    .select()
    .maybeSingle();

  if (roomReserveError) return { error: roomReserveError.message };
  if (!reservedRoom)
    return { error: "This room is no longer available. It may have been booked by someone else." };

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const createGuestCode = () => {
    let r = "";
    for (let i = 0; i < 4; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
    return `G-${r}`;
  };

  let guest: any = null;
  let guestError: any = null;

  for (let attempt = 0; attempt < 6; attempt++) {
    const result = await supabase
      .from("guests")
      .insert({
        room_id: roomId,
        original_room_id: roomId,
        name: name.trim(),
        other_guest_names: otherGuestNames,
        phone: phone.trim(),
        id_proof_name: idProofName.trim(),
        id_proof_number: idProofNumber.trim(),
        people_count: peopleCount,
        rate,
        gst_percent: gstPercent,
        is_active: true,
        guest_code: createGuestCode(),
        gst_number: gstNumber,
        email: email,
      } as any)
      .select()
      .single();

    guest = result.data;
    guestError = result.error;
    const isConflict = guestError?.code === "23505" && String(guestError?.message || "").includes("guest_code");
    if (!isConflict) break;
  }

  if (guestError) {
    await supabase.from("rooms").update({ status: "available" }).eq("id", roomId);
    return { error: guestError.message };
  }

  revalidatePath("/admin/guests");
  revalidatePath("/admin/rooms");
  await bumpCacheVersions(["guests", "rooms", "billing", "dashboard"]);
  return { success: true };
}

export async function checkoutGuest(guestId: string, roomId: string) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  const { data: updatedGuest, error: guestError } = await supabase
    .from("guests")
    .update({ is_active: false, check_out: new Date().toISOString() })
    .eq("id", guestId)
    .eq("room_id", roomId)
    .eq("is_active", true)
    .select()
    .maybeSingle();

  if (guestError) return { error: guestError.message };
  if (!updatedGuest) return { error: "This guest has already been checked out." };

  const { error: roomError } = await supabase
    .from("rooms")
    .update({ status: "cleaning" })
    .eq("id", roomId);

  if (roomError) return { error: roomError.message };

  revalidatePath("/admin/guests");
  revalidatePath("/admin/rooms");
  revalidatePath("/admin/billing");
  await bumpCacheVersions(["guests", "rooms", "billing", "history", "dashboard"]);
  return { success: true };
}

export async function changeGuestRoom(
  guestId: string,
  currentRoomId: string,
  newRoomNumber: string,
  reason?: string,
  newGstPercent?: number,
) {
  const { user, supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  const [{ data: currentRoom }, { data: newRoom }] = await Promise.all([
    supabase.from("rooms").select("room_number").eq("id", currentRoomId).single(),
    supabase.from("rooms").select("id, status, base_price, room_number").eq("room_number", parseInt(newRoomNumber, 10)).single(),
  ]);

  if (!currentRoom) return { error: "Current room not found." };
  if (!newRoom) return { error: "Room number not found." };
  if (newRoom.status !== "available")
    return { error: `Room ${newRoomNumber} is currently ${newRoom.status}.` };

  const { data: reservedRoom, error: reserveError } = await supabase
    .from("rooms")
    .update({ status: "occupied" })
    .eq("id", newRoom.id)
    .eq("status", "available")
    .select()
    .maybeSingle();

  if (reserveError) return { error: reserveError.message };
  if (!reservedRoom)
    return { error: `Room ${newRoomNumber} was just booked by someone else.` };

  const { error: shiftError } = await supabase.from("room_shifts").insert({
    guest_id: guestId,
    from_room_id: currentRoomId,
    to_room_id: newRoom.id,
    from_room_number: currentRoom.room_number,
    to_room_number: newRoom.room_number,
    shifted_by: user?.id || null,
    reason: reason || null,
  });

  if (shiftError) {
    await supabase.from("rooms").update({ status: "available" }).eq("id", newRoom.id);
    return { error: "Failed to record room shift: " + shiftError.message };
  }

  const guestUpdate: Record<string, any> = { room_id: newRoom.id, rate: newRoom.base_price };
  if (newGstPercent !== undefined && newGstPercent >= 0 && newGstPercent <= 100) {
    guestUpdate.gst_percent = newGstPercent;
  }

  const { data: updatedGuest, error: guestError } = await supabase
    .from("guests")
    .update(guestUpdate)
    .eq("id", guestId)
    .eq("room_id", currentRoomId)
    .eq("is_active", true)
    .select()
    .maybeSingle();

  if (guestError) {
    await supabase.from("rooms").update({ status: "available" }).eq("id", newRoom.id);
    return { error: guestError.message };
  }
  if (!updatedGuest) {
    await supabase.from("rooms").update({ status: "available" }).eq("id", newRoom.id);
    return { error: "This guest has been checked out or is no longer active." };
  }

  await Promise.all([
    supabase.from("rooms").update({ status: "cleaning" }).eq("id", currentRoomId),
    supabase.from("orders").update({ room_id: newRoom.id }).eq("room_id", currentRoomId).in("status", ["pending", "accepted", "preparing"]),
    supabase.from("audit_log").insert({
      user_id: user?.id || null,
      action: "room_shift",
      entity_type: "guest",
      entity_id: guestId,
      details: { from_room: currentRoom.room_number, to_room: newRoom.room_number, reason: reason || null },
    }),
  ]);

  revalidatePath("/admin/guests");
  revalidatePath("/admin/rooms");
  await bumpCacheVersions(["guests", "rooms", "billing", "dashboard"]);
  return { success: true };
}

export async function getRoomShiftHistory(guestId: string) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  const { data, error } = await supabase
    .from("room_shifts")
    .select("*")
    .eq("guest_id", guestId)
    .order("created_at", { ascending: true });

  if (error) return { error: error.message };
  return { data };
}
