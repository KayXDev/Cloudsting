import type { LangCode } from "@/lib/i18n";

export type GuideMeta = {
  slug: string;
  href: string;
  category: Record<"en" | "es", string>;
  title: Record<"en" | "es", string>;
  description: Record<"en" | "es", string>;
  kicker: Record<"en" | "es", string>;
  readTime: string;
};

export const GUIDE_INDEX: GuideMeta[] = [
  {
    slug: "choose-minecraft-hosting",
    href: "/guides/choose-minecraft-hosting",
    category: {
      en: "Guide",
      es: "Guia",
    },
    title: {
      en: "How to choose Minecraft hosting",
      es: "Como elegir un hosting de Minecraft",
    },
    description: {
      en: "A practical framework for comparing RAM, CPU, panel quality, backups, DDoS protection, and scaling before you buy.",
      es: "Un marco practico para comparar RAM, CPU, panel, backups, proteccion DDoS y escalado antes de comprar.",
    },
    kicker: {
      en: "Buy with better criteria",
      es: "Compra con mejor criterio",
    },
    readTime: "06 min",
  },
  {
    slug: "reduce-minecraft-server-lag",
    href: "/guides/reduce-minecraft-server-lag",
    category: {
      en: "Guide",
      es: "Guia",
    },
    title: {
      en: "How to reduce Minecraft server lag",
      es: "Como reducir lag en un servidor de Minecraft",
    },
    description: {
      en: "A cleaner way to diagnose lag across chunks, plugins, modpacks, configuration, and infrastructure limits.",
      es: "Una forma mas clara de diagnosticar lag entre chunks, plugins, modpacks, configuracion y limites de infraestructura.",
    },
    kicker: {
      en: "Fix the right bottleneck",
      es: "Ataca el cuello correcto",
    },
    readTime: "05 min",
  },
];

export function getGuides(lang: LangCode) {
  const locale = lang === "es" ? "es" : "en";

  return GUIDE_INDEX.map((guide, index) => ({
    index,
    slug: guide.slug,
    href: guide.href,
    category: guide.category[locale],
    title: guide.title[locale],
    description: guide.description[locale],
    kicker: guide.kicker[locale],
    readTime: guide.readTime,
  }));
}

export function getGuideNeighbors(lang: LangCode, slug: string) {
  const guides = getGuides(lang);
  const currentIndex = guides.findIndex((guide) => guide.slug === slug);

  return {
    previous: currentIndex > 0 ? guides[currentIndex - 1] : null,
    next: currentIndex >= 0 && currentIndex < guides.length - 1 ? guides[currentIndex + 1] : null,
  };
}