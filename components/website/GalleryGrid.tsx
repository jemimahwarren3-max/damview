"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GalleryCategory, GalleryItem } from "@/types";

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  accommodation: "Accommodation",
  pool: "Pool",
  restaurant: "Restaurant",
  gym: "Gym",
  waterfront: "Waterfront",
  activities: "Activities",
  events: "Events",
  general: "General",
};

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory | "all">("all");
  const categories = Array.from(new Set(items.map((item) => item.category)));
  const filtered = activeCategory === "all" ? items : items.filter((item) => item.category === activeCategory);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium",
            activeCategory === "all" ? "border-dv-forest bg-dv-forest text-dv-ivory" : "border-border text-dv-black"
          )}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium",
              activeCategory === category ? "border-dv-forest bg-dv-forest text-dv-ivory" : "border-border text-dv-black"
            )}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((item) => (
          <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={item.url}
              alt={item.caption ?? CATEGORY_LABELS[item.category]}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            {item.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-dv-black/60 px-2 py-1.5 text-center text-xs font-medium text-dv-ivory">
                {item.caption}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
