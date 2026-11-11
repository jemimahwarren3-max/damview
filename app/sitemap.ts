import type { MetadataRoute } from "next";
import { SITE_URL, WEBSITE_NAV } from "@/lib/constants";

const EXTRA_PAGES = ["/guest-centre"];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [...WEBSITE_NAV.map((item) => item.href), ...EXTRA_PAGES];
  return pages.map((href) => ({
    url: `${SITE_URL}${href}`,
    lastModified: new Date(),
    changeFrequency: href === "/" ? "weekly" : "monthly",
    priority: href === "/" ? 1 : 0.7,
  }));
}
