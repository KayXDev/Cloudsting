import type { MetadataRoute } from "next";
import { absoluteUrl, getBaseUrl } from "@/lib/seo";
import { SUPPORTED_LANGS } from "@/lib/i18n";

const blockedPaths = [
  "/admin/",
  "/billing",
  "/checkout/",
  "/community/forum",
  "/community/search",
  "/dashboard",
  "/login",
  "/profile",
  "/register",
  "/support",
  "/wallet",
];

function localizedBlockedPaths() {
  return blockedPaths.flatMap((path) => SUPPORTED_LANGS.map((lang) => `/${lang}${path}`));
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", ...blockedPaths, ...localizedBlockedPaths()],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended"],
        allow: [
          "/",
          "/minecraft-server-hosting",
          "/minecraft-hosting-europe",
          "/forge-server-hosting",
          "/fabric-server-hosting",
          "/paper-server-hosting",
          "/faq",
          "/features",
          "/pricing",
          "/status",
          "/free-minecraft-hosting",
          "/modded-minecraft-hosting",
          "/blog",
          "/blog/how-much-ram-for-minecraft-server",
          "/blog/forge-vs-fabric-for-server-owners",
          "/blog/how-to-back-up-a-minecraft-server",
          "/guides",
          "/guides/choose-minecraft-hosting",
          "/guides/reduce-minecraft-server-lag",
          "/community/server-list",
          ...SUPPORTED_LANGS.flatMap((lang) => [
            `/${lang}`,
            `/${lang}/minecraft-server-hosting`,
            `/${lang}/minecraft-hosting-europe`,
            `/${lang}/forge-server-hosting`,
            `/${lang}/fabric-server-hosting`,
            `/${lang}/paper-server-hosting`,
            `/${lang}/faq`,
            `/${lang}/features`,
            `/${lang}/pricing`,
            `/${lang}/status`,
            `/${lang}/free-minecraft-hosting`,
            `/${lang}/modded-minecraft-hosting`,
            `/${lang}/blog`,
            `/${lang}/blog/how-much-ram-for-minecraft-server`,
            `/${lang}/blog/forge-vs-fabric-for-server-owners`,
            `/${lang}/blog/how-to-back-up-a-minecraft-server`,
            `/${lang}/guides`,
            `/${lang}/guides/choose-minecraft-hosting`,
            `/${lang}/guides/reduce-minecraft-server-lag`,
            `/${lang}/community/server-list`,
          ]),
        ],
        disallow: ["/api/", ...blockedPaths, ...localizedBlockedPaths()],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getBaseUrl(),
  };
}