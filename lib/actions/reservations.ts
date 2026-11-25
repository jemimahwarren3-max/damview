"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { bumpCacheVersions } from "@/lib/cache/redis";

export async function createReservation(formData: FormData) {
  const { user, supabase } = await requireAuth([
    "admin",
    "superadmin",
    "manager",
    "cashier",
  ]);

  const roomId = formData.get("room_id") as string;
  const guestName = (formData.get("guest_name") as string)?.trim();
  const guestPhone = (formData.get("guest_phone") as string)?.trim() || null;
  const guestEmail = (formData.get("guest_email") as string)?.trim() || null;
  const guestIdType = (formData.get("guest_id_type") as string)?.trim() || null;
  const guestIdNumber =
    (formData.get("guest_id_number") as string)?.trim() || null;
  const peopleCount = parseInt(formData.get("people_count") as string, 10);
  const checkInDate = formData.get("check_in_date") as string;
  const checkOutDate =
    (formData.get("check_out_date") as string) || null;
  const billingMode =
    (formData.get("billing_mode") as string) || "nightly";
  const rate = parseFloat(formData.get("rate") as string);
  const hourlyRate = formData.get("hourly_rate")
    ? parseFloat(formData.get("hourly_rate") as string)
    : null;
  const depositAmount = parseFloat(
    (formData.get("deposit_amount") as string) || "0",
  );
  const depositPaid = formData.get("deposit_paid") === "true";
  const depositPaymentMode =
    (formData.get("deposit_payment_mode") as string) || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!guestName || guestName.length < 2)
    return { error: "Guest name must be at least 2 characters." };
  if (!roomId) return { error: "Please select a room." };
  if (!checkInDate) return { error: "Check-in date is required." };
  if (isNaN(rate) || rate < 0) return { error: "Invalid rate." };
  if (isNaN(peopleCount) || peopleCount < 1)
    return { error: "At least 1 guest required." };
  if (billingMode === "hourly" && (!hourlyRate || hourlyRate < 0))
    return { error: "Hourly rate is required for hourly billing." };

  const checkIn = new Date(checkInDate);
  if (checkOutDate) {
    const checkOut = new Date(checkOutDate);
    if (checkOut <= checkIn)
      return { error: "Check-out must be after check-in." };
  }

  // Check for conflicting reservations on this room
  const { count } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("room_id", roomId)
    .in("status", ["confirmed"])
    .lte("check_in_date", checkOutDate || checkInDate)
    .gte("check_out_date", checkInDate);

  if (count && count > 0)
    return {
      error: "This room has a conflicting reservation for the selected dates.",
    };

  const { error } = await supabase.from("reservations").insert({
    room_id: roomId,
    guest_name: guestName,
    guest_phone: guestPhone,
    guest_email: guestEmail,
    guest_id_type: guestIdType,
    guest_id_number: guestIdNumber,
    people_count: peopleCount,
    check_in_date: checkInDate,
    check_out_date: checkOutDate,
    billing_mode: billingMode,
    rate,
    hourly_rate: hourlyRate,
    deposit_amount: depositAmount,
    deposit_paid: depositPaid,
    deposit_payment_mode: depositPaymentMode,
    notes,
    status: "confirmed",
    booked_by: user.id,
  } as any);

  if (error) return { error: error.message };

  // Mark room as reserved if check-in is today
  const today = new Date().toISOString().split("T")[0];
  if (checkInDate === today) {
    await supabase
      .from("rooms")
      .update({ status: "reserved" })
      .eq("id", roomId)
      .in("status", ["available"]);
  }

  revalidatePath("/admin/rooms");
  revalidatePath("/admin/guests");
  await bumpCacheVersions(["rooms", "guests", "dashboard"]);
  return { success: true };
}

export async function cancelReservation(reservationId: string) {
  const { supabase } = await requireAuth([
    "admin",
    "superadmin",
    "manager",
    "cashier",
  ]);

  const { data, error } = await supabase
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", reservationId)
    .eq("status", "confirmed")
    .select("room_id")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Reservation not found or already processed." };

  // Free the room if it was marked reserved
  await supabase
    .from("rooms")
    .update({ status: "available" })
    .eq("id", data.room_id)
    .eq("status", "reserved");

  revalidatePath("/admin/rooms");
  await bumpCacheVersions(["rooms", "guests", "dashboard"]);
  return { success: true };
}

export async function checkInFromReservation(reservationId: string) {
  const { supabase } = await requireAuth([
    "admin",
    "superadmin",
    "manager",
    "cashier",
  ]);

  const { data: reservation, error: fetchErr } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", reservationId)
    .eq("status", "confirmed")
    .single();

  if (fetchErr || !reservation)
    return { error: "Reservation not found or already processed." };

  // Reserve the room atomically
  const { data: reservedRoom, error: roomErr } = await supabase
    .from("rooms")
    .update({ status: "occupied" })
    .eq("id", reservation.room_id)
    .in("status", ["available", "reserved"])
    .select()
    .maybeSingle();

  if (roomErr) return { error: roomErr.message };
  if (!reservedRoom)
    return { error: "Room is no longer available for check-in." };

  // Create guest record
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let guestCode = "";
  for (let i = 0; i < 4; i++)
    guestCode += chars.charAt(Math.floor(Math.random() * chars.length));
  guestCode = `G-${guestCode}`;

  const { data: guest, error: guestErr } = await supabase
    .from("guests")
    .insert({
      room_id: reservation.room_id,
      original_room_id: reservation.room_id,
      name: reservation.guest_name,
      phone: reservation.guest_phone,
      email: reservation.guest_email,
      id_proof_name: reservation.guest_id_type,
      id_proof_number: reservation.guest_id_number,
      people_count: reservation.people_count,
      rate: reservation.rate,
      gst_percent: 15,
      is_active: true,
      guest_code: guestCode,
      billing_mode: reservation.billing_mode,
      hourly_rate: reservation.hourly_rate,
      reservation_id: reservationId,
    } as any)
    .select()
    .single();

  if (guestErr) {
    await supabase
      .from("rooms")
      .update({ status: "available" })
      .eq("id", reservation.room_id);
    return { error: guestErr.message };
  }

  // Update reservation status
  await supabase
    .from("reservations")
    .update({ status: "checked_in" })
    .eq("id", reservationId);

  revalidatePath("/admin/guests");
  revalidatePath("/admin/rooms");
  await bumpCacheVersions(["guests", "rooms", "billing", "dashboard"]);
  return { success: true, guestId: guest?.id };
}

export async function getReservations(filters?: {
  status?: string;
  date?: string;
  search?: string;
}) {
  const { supabase } = await requireAuth([
    "admin",
    "superadmin",
    "manager",
    "cashier",
  ]);

  let query = supabase
    .from("reservations")
    .select("*, rooms:room_id ( room_number, type, label )")
    .order("check_in_date", { ascending: true });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.date) {
    query = query.eq("check_in_date", filters.date);
  }
  if (filters?.search) {
    query = query.or(
      `guest_name.ilike.%${filters.search}%,guest_phone.ilike.%${filters.search}%`,
    );
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data };
}
