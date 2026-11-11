import type { MetadataRoute } from "next";
import { SITE_URL, WEBSITE_NAV } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  return WEBSITE_NAV.map((item) => ({
    url: `${SITE_URL}${item.href}`,
    lastModified: new Date(),
    changeFrequency: item.href === "/" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : 0.7,
  }));
}
