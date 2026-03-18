import type { Metadata } from "next";
import { headers } from "next/headers";
import { DEFAULT_LANG, isLangCode, SUPPORTED_LANGS, type LangCode } from "@/lib/i18n";

type SeoOptions = {
  title?: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  hreflang?: boolean;
};

const DEFAULT_BASE_URL = "http://localhost:3000";

export const siteConfig = {
  name: "Cloudsting",
  shortName: "Cloudsting",
  description:
    "Minecraft hosting for Europe with fast 24/7 servers, low-latency coverage for Spain and EU communities, NVMe storage, and DDoS protection.",
  keywords: [
    "minecraft hosting",
    "minecraft server hosting",
    "minecraft hosting europe",
    "minecraft hosting spain",
    "24/7 minecraft server",
    "free minecraft hosting",
    "premium minecraft hosting",
    "minecraft vps",
    "modded minecraft hosting",
    "minecraft server plans",
    "cloudsting",
  ],
  discordUrl: "https://discord.gg/wrld999",
  supportEmail: "support@cloudsting.com",
  ogImagePath: "/opengraph-image",
  twitterImagePath: "/twitter-image",
};

const OPEN_GRAPH_LOCALE_BY_LANG: Partial<Record<LangCode, string>> = {
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  it: "it_IT",
  pt: "pt_PT",
  nl: "nl_NL",
  pl: "pl_PL",
  cs: "cs_CZ",
  tr: "tr_TR",
};

function normalizeBaseUrl(value?: string) {
  if (!value) return DEFAULT_BASE_URL;
  return value.replace(/\/$/, "");
}

export function getBaseUrl() {
  return normalizeBaseUrl(process.env.APP_URL);
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseUrl()}${normalizedPath}`;
}

function normalizePath(path = "/") {
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path.replace(/\/$/, "") : `/${path.replace(/\/$/, "")}`;
}

export function buildLocalizedPath(path: string, lang: LangCode) {
  const normalizedPath = normalizePath(path);
  if (normalizedPath === "/") return `/${lang}`;
  return `/${lang}${normalizedPath}`;
}

function stripLocalePrefix(pathname: string) {
  const normalizedPath = normalizePath(pathname);
  const [, maybeLang, ...rest] = normalizedPath.split("/");
  if (!isLangCode(maybeLang)) return normalizedPath;
  return rest.length === 0 ? "/" : `/${rest.join("/")}`;
}

function getRequestLang() {
  const headerValue = headers().get("x-kx-lang");
  return isLangCode(headerValue) ? headerValue : DEFAULT_LANG;
}

function getRequestPath(path: string) {
  const requestedPath = headers().get("x-kx-original-pathname");
  if (!requestedPath) return normalizePath(path);
  return normalizePath(requestedPath);
}

function createLanguageAlternates(path: string) {
  const normalizedPath = normalizePath(path);
  const languages = Object.fromEntries(
    SUPPORTED_LANGS.map((lang) => [lang, buildLocalizedPath(normalizedPath, lang)])
  ) as Record<string, string>;

  languages["x-default"] = normalizedPath;

  return languages;
}

export function createMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  noIndex = false,
  hreflang = false,
}: SeoOptions): Metadata {
  const normalizedPath = normalizePath(path);
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const requestLang = getRequestLang();
  const requestPath = getRequestPath(normalizedPath);
  const canonical = stripLocalePrefix(requestPath) === normalizedPath ? requestPath : normalizedPath;

  return {
    metadataBase: new URL(getBaseUrl()),
    title: fullTitle,
    description,
    applicationName: siteConfig.name,
    keywords: [...siteConfig.keywords, ...keywords],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "games",
    referrer: "origin-when-cross-origin",
    alternates: {
      canonical,
      languages: !noIndex && hreflang ? createLanguageAlternates(normalizedPath) : undefined,
    },
    openGraph: {
      type: "website",
      locale: OPEN_GRAPH_LOCALE_BY_LANG[requestLang] ?? "en_US",
      url: canonical,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      images: [
        {
          url: siteConfig.ogImagePath,
          alt: `${siteConfig.name} Minecraft hosting`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [siteConfig.twitterImagePath],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}