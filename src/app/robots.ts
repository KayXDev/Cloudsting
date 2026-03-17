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
          "/faq",
          "/features",
          "/pricing",
          "/status",
          "/community/server-list",
          ...SUPPORTED_LANGS.flatMap((lang) => [
            `/${lang}`,
            `/${lang}/faq`,
            `/${lang}/features`,
            `/${lang}/pricing`,
            `/${lang}/status`,
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