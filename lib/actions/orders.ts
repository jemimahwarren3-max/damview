"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { bumpCacheVersions } from "@/lib/cache/redis";

export async function advanceOrderStatus(orderId: string, currentStatus: string) {
  const { supabase } = await requireAuth(["kitchen", "admin", "superadmin", "manager"]);

  const statusMap: Record<string, string> = {
    accepted: "preparing",
    preparing: "prepared",
    prepared: "served",
  };

  const nextStatus = statusMap[currentStatus];
  if (!nextStatus) return { error: "Invalid state transition" };

  // Create a service-role client to bypass RLS on the orders table since staff
  // (admin/manager) cannot update orders via standard client.
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: updatedOrder, error } = await supabaseAdmin
    .from("orders")
    .update({
      status: nextStatus as "pending" | "accepted" | "preparing" | "served" | "cancelled",
    })
    .eq("id", orderId)
    .eq("status", currentStatus as "pending" | "accepted" | "preparing" | "served" | "cancelled")
    .select()
    .maybeSingle();

  if (error) return { error: error.message };
  if (!updatedOrder) {
    return { error: "Order status was already changed by someone else." };
  }

  // Keep revalidatePath — order status is visible to multiple kitchen staff simultaneously
  revalidatePath("/admin/orders");
  await bumpCacheVersions(["orders", "tables", "billing", "dashboard", "reports"]);
  return { success: true };
}

export async function acceptOrder(orderId: string) {
  const { supabase } = await requireAuth(["kitchen", "admin", "superadmin", "manager"]);

  const { data, error } = await supabase.rpc("accept_order_safe", {
    p_order_id: orderId,
  });

  if (error) return { error: error.message };

  // Keep revalidatePath — order acceptance deducts inventory visible to all staff
  revalidatePath("/admin/orders");
  await bumpCacheVersions(["orders", "menu", "tables", "billing", "dashboard", "reports"]);
  return { success: true };
}

export async function rejectOrder(orderId: string) {
  const { supabase } = await requireAuth(["kitchen", "admin", "superadmin", "manager"]);
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: updatedOrder, error } = await supabaseAdmin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .eq("status", "pending")
    .select()
    .maybeSingle();

  if (error) return { error: error.message };
  if (!updatedOrder) return { error: "Order was already processed by someone else." };

  revalidatePath("/admin/orders");
  await bumpCacheVersions(["orders", "dashboard", "reports"]);
  return { success: true };
}

export async function rejectOrderItem(orderId: string, orderItemId: string) {
  const { supabase } = await requireAuth(["kitchen", "admin", "superadmin", "manager"]);
  
  const { data: originalOrder, error: orderError } = await supabase
    .from("orders")
    .select("table_id, room_id, entry_mode")
    .eq("id", orderId)
    .single();
    
  if (orderError) return { error: orderError.message };

  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("id")
    .eq("order_id", orderId);

  if (itemsError) return { error: itemsError.message };

  if (orderItems.length <= 1) {
    // If it's the only item, just cancel the whole order.
    return rejectOrder(orderId);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Otherwise create a new cancelled order
  const { data: newOrder, error: createError } = await supabaseAdmin
    .from("orders")
    .insert({
      table_id: originalOrder.table_id,
      room_id: originalOrder.room_id,
      entry_mode: originalOrder.entry_mode,
      status: "cancelled"
    })
    .select()
    .single();

  if (createError) return { error: createError.message };

  // Move the item
  const { error: moveError } = await supabaseAdmin
    .from("order_items")
    .update({ order_id: newOrder.id })
    .eq("id", orderItemId);

  if (moveError) return { error: moveError.message };

  revalidatePath("/admin/orders");
  revalidatePath("/admin/tables");
  await bumpCacheVersions(["orders", "tables", "dashboard", "reports"]);
  return { success: true };
}

