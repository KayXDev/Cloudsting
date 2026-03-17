import type { MetadataRoute } from "next";
import { SUPPORTED_LANGS } from "@/lib/i18n";
import { absoluteUrl, buildLocalizedPath } from "@/lib/seo";

const routes = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/free-minecraft-hosting", changeFrequency: "weekly", priority: 0.88 },
  { path: "/modded-minecraft-hosting", changeFrequency: "weekly", priority: 0.88 },
  { path: "/guides", changeFrequency: "weekly", priority: 0.82 },
  { path: "/guides/choose-minecraft-hosting", changeFrequency: "monthly", priority: 0.76 },
  { path: "/guides/reduce-minecraft-server-lag", changeFrequency: "monthly", priority: 0.76 },
  { path: "/pricing", changeFrequency: "daily", priority: 0.95 },
  { path: "/features", changeFrequency: "weekly", priority: 0.8 },
  { path: "/faq", changeFrequency: "weekly", priority: 0.75 },
  { path: "/status", changeFrequency: "hourly", priority: 0.7 },
  { path: "/community/server-list", changeFrequency: "daily", priority: 0.65 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const baseEntries = routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const localizedEntries = SUPPORTED_LANGS.flatMap((lang) =>
    routes.map((route) => ({
      url: absoluteUrl(buildLocalizedPath(route.path, lang)),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  );

  return [...baseEntries, ...localizedEntries];
}