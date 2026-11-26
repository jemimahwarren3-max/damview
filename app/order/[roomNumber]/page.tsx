import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import MenuOrder from "../MenuOrder";

export default async function RoomOrderPage({
  params,
}: {
  params: Promise<{ roomNumber: string }>;
}) {
  const { roomNumber } = await params;
  const num = parseInt(roomNumber, 10);
  if (isNaN(num)) notFound();

  const supabase = await createClient();

  const [roomResult, menuResult] = await Promise.all([
    supabase
      .from("rooms")
      .select("id, room_number, label, status")
      .eq("room_number", num)
      .single(),
    supabase
      .from("food_menu")
      .select("id, name, price, category, is_active, available_quantity")
      .eq("is_active", true)
      .order("category")
      .order("name"),
  ]);

  if (!roomResult.data) notFound();

  const room = roomResult.data;
  const menu = menuResult.data || [];

  if (room.status !== "occupied") {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh p-6 text-center">
        <h1 className="text-xl font-bold text-neutral-900 mb-2">Room Not Active</h1>
        <p className="text-neutral-500 text-sm">
          This room doesn't have an active guest. Please contact reception if you need
          assistance.
        </p>
      </div>
    );
  }

  return (
    <MenuOrder
      menu={menu}
      roomId={room.id}
      tableId={null}
      locationLabel={room.label || `Room ${room.room_number}`}
      guestCode="ROOM_QR"
    />
  );
}
