import type { Metadata } from "next";

type SeoOptions = {
  title?: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
};

const DEFAULT_BASE_URL = "http://localhost:3000";

export const siteConfig = {
  name: "Cloudsting",
  shortName: "Cloudsting",
  description:
    "Premium Minecraft server hosting with instant deployment, NVMe storage, DDoS protection, and scalable plans for growing communities.",
  keywords: [
    "minecraft hosting",
    "minecraft server hosting",
    "free minecraft hosting",
    "premium minecraft hosting",
    "minecraft vps",
    "modded minecraft hosting",
    "minecraft server plans",
    "cloudsting",
  ],
  discordUrl: "https://discord.gg/wrld999",
  supportEmail: "support@cloudsting.com",
  ogImagePath: "/home-jungle-bg.jpg",
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

export function createMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  noIndex = false,
}: SeoOptions): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const canonical = path === "/" ? "/" : path.replace(/\/$/, "");

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
    },
    openGraph: {
      type: "website",
      locale: "en_US",
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
      images: [siteConfig.ogImagePath],
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