import type { MetadataRoute } from "next";
import { WEBSITE_NAV } from "@/lib/constants";

/**
 * NEXT_PUBLIC_SITE_URL should be set once a real domain is live (Stage 12
 * deployment). Falls back to a placeholder so this still builds without it.
 */
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://damviewresort.example";

export default function sitemap(): MetadataRoute.Sitemap {
  return WEBSITE_NAV.map((item) => ({
    url: `${BASE_URL}${item.href}`,
    lastModified: new Date(),
    changeFrequency: item.href === "/" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : 0.7,
  }));
}
