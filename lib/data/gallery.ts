import type { GalleryItem, GalleryCategory } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { GALLERY_ITEMS as FALLBACK_GALLERY_ITEMS } from "@/lib/data/admin-fallback";

export async function getGalleryItems(): Promise<GalleryItem[]> {
  "use cache";
  const supabase = getSupabaseClient();
  if (!supabase) return FALLBACK_GALLERY_ITEMS;

  const { data, error } = await supabase
    .from("gallery_items")
    .select("id, category, type, url, caption")
    .order("created_at");
  if (error) return FALLBACK_GALLERY_ITEMS;

  return data.map((item) => ({
    id: item.id,
    category: item.category as GalleryCategory,
    type: item.type as "image" | "video",
    url: item.url,
    caption: item.caption ?? undefined,
  }));
}
