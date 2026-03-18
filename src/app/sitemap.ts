import type { MetadataRoute } from "next";
import { SUPPORTED_LANGS } from "@/lib/i18n";
import { absoluteUrl, buildLocalizedPath } from "@/lib/seo";

const routes = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/minecraft-server-hosting", changeFrequency: "weekly", priority: 0.94 },
  { path: "/minecraft-hosting-europe", changeFrequency: "weekly", priority: 0.9 },
  { path: "/minecraft-hosting-spain", changeFrequency: "weekly", priority: 0.89 },
  { path: "/forge-server-hosting", changeFrequency: "weekly", priority: 0.88 },
  { path: "/fabric-server-hosting", changeFrequency: "weekly", priority: 0.88 },
  { path: "/paper-server-hosting", changeFrequency: "weekly", priority: 0.88 },
  { path: "/free-minecraft-hosting", changeFrequency: "weekly", priority: 0.88 },
  { path: "/modded-minecraft-hosting", changeFrequency: "weekly", priority: 0.88 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.84 },
  { path: "/blog/how-to-create-a-minecraft-server", changeFrequency: "monthly", priority: 0.79 },
  { path: "/blog/how-much-ram-for-minecraft-server", changeFrequency: "monthly", priority: 0.78 },
  { path: "/blog/forge-vs-fabric-for-server-owners", changeFrequency: "monthly", priority: 0.78 },
  { path: "/blog/how-to-back-up-a-minecraft-server", changeFrequency: "monthly", priority: 0.78 },
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