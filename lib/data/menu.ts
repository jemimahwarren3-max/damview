import type { MenuCategory, MenuItem } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { MENU_CATEGORIES as FALLBACK_CATEGORIES, MENU_ITEMS as FALLBACK_ITEMS } from "@/lib/data/admin-fallback";

export const RESTAURANT_IMAGE =
  "https://images.pexels.com/photos/8021129/pexels-photo-8021129.jpeg?auto=compress&cs=tinysrgb&w=1200";

const FALLBACK = { categories: FALLBACK_CATEGORIES, items: FALLBACK_ITEMS };

export async function getMenu(): Promise<{ categories: MenuCategory[]; items: MenuItem[] }> {
  "use cache";
  const supabase = getSupabaseClient();
  if (!supabase) return FALLBACK;

  const { data: categories, error: categoriesError } = await supabase.from("menu_categories").select("id, name").order("id");
  if (categoriesError) return FALLBACK;

  const { data: items, error: itemsError } = await supabase
    .from("menu_items")
    .select("id, category_id, name, price, description, image, available")
    .order("id");
  if (itemsError) return FALLBACK;

  return {
    categories,
    items: items.map((item) => ({
      id: item.id,
      categoryId: item.category_id,
      name: item.name,
      price: Number(item.price),
      description: item.description ?? undefined,
      image: item.image ?? undefined,
      available: item.available,
    })),
  };
}
