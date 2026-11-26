"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { bumpCacheVersions } from "@/lib/cache/redis";

async function generateItemCode(supabase: any): Promise<string> {
  const { data: lastItem } = await supabase
    .from("food_menu")
    .select("item_code")
    .not("item_code", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1;
  if (lastItem?.item_code) {
    const match = lastItem.item_code.match(/F-(\d+)/);
    if (match) nextNumber = parseInt(match[1], 10) + 1;
  }
  return `F-${String(nextNumber).padStart(3, "0")}`;
}

export async function addMenuItem(formData: FormData) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "kitchen"]);

  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const available_quantity = parseInt(formData.get("available_quantity") as string, 10);
  const is_active = formData.get("is_active") === "true";
  const category = (formData.get("category") as string) || "General";
  const gst_percent = parseFloat(formData.get("gst_percent") as string) || 5.0;
  const is_breakfast = formData.get("is_breakfast") === "true";
  const breakfast_start_time = (formData.get("breakfast_start_time") as string) || "07:00";
  const breakfast_end_time = (formData.get("breakfast_end_time") as string) || "10:30";

  const item_code = await generateItemCode(supabase);

  const insertData: any = {
    name,
    price,
    available_quantity,
    is_active,
    item_code,
    category,
    gst_percent,
    is_breakfast,
  };

  if (is_breakfast) {
    insertData.breakfast_start_time = breakfast_start_time;
    insertData.breakfast_end_time = breakfast_end_time;
  }

  const { error } = await supabase.from("food_menu").insert(insertData);
  if (error) return { error: error.message };

  // Structural add — revalidate so the new item appears on next server render
  revalidatePath("/admin/menu");
  revalidatePath("/superadmin/menu");
  await bumpCacheVersions(["menu", "orders", "tables", "dashboard", "reports"]);
  return { success: true };
}

export async function updateMenuItem(id: string, updates: any) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "kitchen"]);

  if ("image_url" in updates) {
    const { data: currentItem } = await supabase
      .from("food_menu")
      .select("image_url")
      .eq("id", id)
      .single();

    if (currentItem?.image_url && currentItem.image_url !== updates.image_url) {
      const urlParts = currentItem.image_url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      if (fileName) {
        await supabase.storage.from("food_images").remove([fileName]);
      }
    }
  }

  const { error } = await supabase.from("food_menu").update(updates).eq("id", id);
  if (error) return { error: error.message };

  // No revalidatePath — MenuList uses optimistic useState updates.
  // ISR will refresh the cache within revalidate interval on next visit.
  await bumpCacheVersions(["menu", "orders", "tables", "dashboard", "reports"]);
  return { success: true };
}

export async function deleteMenuItem(id: string) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "kitchen"]);

  const { data: item } = await supabase
    .from("food_menu")
    .select("image_url")
    .eq("id", id)
    .single();

  if (item?.image_url) {
    const urlParts = item.image_url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    if (fileName) {
      await supabase.storage.from("food_images").remove([fileName]);
    }
  }

  const { error } = await supabase.from("food_menu").delete().eq("id", id);
  if (error) return { error: error.message };

  // Structural delete — revalidate both paths
  revalidatePath("/admin/menu");
  revalidatePath("/superadmin/menu");
  await bumpCacheVersions(["menu", "orders", "tables", "dashboard", "reports"]);
  return { success: true };
}

export async function toggleNonBreakfastItems(enable: boolean) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "kitchen"]);

  const { error } = await supabase
    .from("food_menu")
    .update({ is_active: enable })
    .eq("is_breakfast", false);

  if (error) return { error: error.message };

  // Bulk update — revalidate to reflect changes
  revalidatePath("/admin/menu");
  revalidatePath("/superadmin/menu");
  await bumpCacheVersions(["menu", "orders", "tables", "dashboard", "reports"]);
  return { success: true };
}
