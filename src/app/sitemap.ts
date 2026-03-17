import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const routes = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/pricing", changeFrequency: "daily", priority: 0.95 },
  { path: "/features", changeFrequency: "weekly", priority: 0.8 },
  { path: "/faq", changeFrequency: "weekly", priority: 0.75 },
  { path: "/status", changeFrequency: "hourly", priority: 0.7 },
  { path: "/community/forum", changeFrequency: "weekly", priority: 0.55 },
  { path: "/community/search", changeFrequency: "weekly", priority: 0.5 },
  { path: "/community/server-list", changeFrequency: "daily", priority: 0.65 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}