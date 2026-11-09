export type GalleryCategory =
  | "accommodation"
  | "pool"
  | "restaurant"
  | "gym"
  | "waterfront"
  | "activities"
  | "events"
  | "general";

export interface GalleryItem {
  id: string;
  category: GalleryCategory;
  type: "image" | "video";
  url: string;
  caption?: string;
}
