import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

// /pay/* URLs embed a one-time payment access secret in the path itself -
// these must never be crawled or they could end up cached/visible in search
// results, letting anyone who finds the URL view someone else's booking.
const DISALLOW = ["/admin", "/api", "/pay"];

// Search and AI-search crawlers explicitly allowed through, matching the
// same rules as everyone else - listed out so the policy is a deliberate
// decision, not an accident of a blanket "*" rule.
const SEARCH_BOTS = [
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot",
  "DuckAssistBot",
  "FacebookBot",
];

// AI training crawlers - also allowed, by explicit choice, so the site has a
// chance of being referenced when people ask an AI assistant for resort
// recommendations in Zimbabwe.
const TRAINING_BOTS = ["GPTBot", "ClaudeBot", "Google-Extended", "Meta-ExternalAgent", "Amazonbot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...SEARCH_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
      ...TRAINING_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
