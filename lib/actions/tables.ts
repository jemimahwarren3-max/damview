"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { bumpCacheVersions } from "@/lib/cache/redis";

export async function addTable(tableNumber: number, capacity: number) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  if (!Number.isInteger(tableNumber) || tableNumber < 1 || tableNumber > 999) {
    return { error: "Table number must be between 1 and 999." };
  }
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) {
    return { error: "Capacity must be between 1 and 50." };
  }

  const { count } = await supabase
    .from("restaurant_tables")
    .select("*", { count: "exact", head: true })
    .eq("table_number", tableNumber);

  if (count && count > 0) {
    return { error: `Table ${tableNumber} already exists.` };
  }

  const { error } = await supabase.from("restaurant_tables").insert({ table_number: tableNumber, capacity });
  if (error) return { error: error.message };

  // Structural add
  revalidatePath("/admin/tables");
  revalidatePath("/superadmin/tables");
  await bumpCacheVersions(["tables", "orders", "billing", "dashboard"]);
  return { success: true };
}

export async function updateTable(
  tableId: string,
  updates: { table_number?: number; capacity?: number },
) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  if (updates.table_number !== undefined) {
    if (!Number.isInteger(updates.table_number) || updates.table_number < 1 || updates.table_number > 999) {
      return { error: "Table number must be between 1 and 999." };
    }
  }
  if (updates.capacity !== undefined) {
    if (!Number.isInteger(updates.capacity) || updates.capacity < 1 || updates.capacity > 50) {
      return { error: "Capacity must be between 1 and 50." };
    }
  }

  const { error } = await supabase.from("restaurant_tables").update(updates).eq("id", tableId);
  if (error) return { error: error.message };

  // No revalidatePath — TableList uses optimistic useState updates
  await bumpCacheVersions(["tables", "orders", "billing", "dashboard"]);
  return { success: true };
}

export async function deleteTable(tableId: string) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  const { data: table } = await supabase
    .from("restaurant_tables")
    .select("status")
    .eq("id", tableId)
    .single();

  if (table?.status === "occupied") {
    return { error: "Cannot delete an occupied table. Settle the bill and free the table first." };
  }

  const { count: billCount, error: billCountError } = await supabase
    .from("restaurant_bills")
    .select("id", { count: "exact", head: true })
    .eq("table_id", tableId);

  if (billCountError) return { error: billCountError.message };
  if ((billCount || 0) > 0) {
    return {
      error:
        "Cannot delete this table because it has billing history. You can keep it inactive by not using it, or ask support to archive old references first.",
    };
  }

  const { error } = await supabase.from("restaurant_tables").delete().eq("id", tableId);
  if (error) {
    if (error.message.includes("restaurant_bills_table_id_fkey")) {
      return {
        error:
          "Cannot delete this table because it has billing history. Archive related bills first.",
      };
    }
    return { error: error.message };
  }

  // Structural delete
  revalidatePath("/admin/tables");
  revalidatePath("/superadmin/tables");
  await bumpCacheVersions(["tables", "orders", "billing", "dashboard"]);
  return { success: true };
}

export async function updateTableStatus(
  tableId: string,
  status: "available" | "occupied",
) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  if (status === "available") {
    // Only cancel non-settled orders. "billed" orders must be preserved
    // because they have a corresponding restaurant_bill record (settlement history).
    //
    // We include "served" here so that if a customer walked out without paying,
    // their served orders don't leak into the next customer's bill.
    const { error: clearOrdersError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("table_id", tableId)
      .in("status", ["pending", "accepted", "preparing", "prepared", "served"]);

    if (clearOrdersError) return { error: clearOrdersError.message };
  }

  const { error } = await supabase.from("restaurant_tables").update({ status }).eq("id", tableId);
  if (error) return { error: error.message };

  // No revalidatePath — TableList uses optimistic useState updates
  await bumpCacheVersions(["tables", "orders", "billing", "dashboard"]);
  return { success: true };
}
