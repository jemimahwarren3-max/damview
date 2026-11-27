import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import MenuOrder from "../../MenuOrder";

export default async function TableOrderPage({
  params,
}: {
  params: Promise<{ tableNumber: string }>;
}) {
  await connection();
  const { tableNumber } = await params;
  const num = parseInt(tableNumber, 10);
  if (isNaN(num)) notFound();

  const supabase = await createClient();

  const [tableResult, menuResult] = await Promise.all([
    supabase
      .from("restaurant_tables")
      .select("id, table_number, capacity")
      .eq("table_number", num)
      .single(),
    supabase
      .from("food_menu")
      .select("id, name, price, category, is_active, available_quantity")
      .eq("is_active", true)
      .order("category")
      .order("name"),
  ]);

  if (!tableResult.data) notFound();

  const table = tableResult.data;
  const menu = menuResult.data || [];

  return (
    <MenuOrder
      menu={menu}
      roomId={null}
      tableId={table.id}
      locationLabel={`Table ${table.table_number} (${table.capacity} seats)`}
      guestCode="TABLE_QR"
    />
  );
}
