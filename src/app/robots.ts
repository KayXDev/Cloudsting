import type { MetadataRoute } from "next";
import { absoluteUrl, getBaseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/billing", "/checkout/", "/dashboard", "/login", "/profile", "/register", "/wallet"],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended"],
        allow: ["/", "/faq", "/features", "/pricing", "/status", "/community/forum", "/community/search", "/community/server-list"],
        disallow: ["/admin/", "/api/", "/billing", "/checkout/", "/dashboard", "/profile", "/support", "/wallet"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getBaseUrl(),
  };
}