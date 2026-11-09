import type { GalleryItem, GalleryCategory } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";

export async function getGalleryItems(): Promise<GalleryItem[]> {
  "use cache";
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("gallery_items")
    .select("id, category, type, url, caption")
    .order("created_at");
  if (error) throw error;

  return data.map((item) => ({
    id: item.id,
    category: item.category as GalleryCategory,
    type: item.type as "image" | "video",
    url: item.url,
    caption: item.caption ?? undefined,
  }));
}
