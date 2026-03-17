import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { PricingClientGrid, type PricingPlan } from "@/components/PricingClientGrid";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import { prisma } from "@/server/db";
import { getAccessTokenFromCookies } from "@/server/auth/session";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Minecraft Hosting Pricing",
    description:
      "Compare Cloudsting Minecraft hosting plans with instant deployment, NVMe SSD storage, DDoS protection, and flexible resources.",
    path: "/pricing",
    keywords: ["minecraft pricing", "minecraft hosting plans", "budget minecraft hosting"],
    hreflang: true,
  });
}

function fallbackPlans(lang: Parameters<typeof t>[0]): PricingPlan[] {
  return [
    {
      slug: "vanilla-start",
      name: "Vanilla Start",
      ramMb: 2048,
      cpuPercent: 100,
      diskMb: 10240,
      priceMonthlyCents: 599,
      features: [
        t(lang, "pricing.feature.instant"),
        t(lang, "pricing.feature.vanilla"),
        t(lang, "pricing.feature.nvme"),
        t(lang, "pricing.feature.ddos"),
        `${t(lang, "pricing.feature.databases")}: 1`,
        `${t(lang, "pricing.feature.backups")}: 1`,
      ],
    },
    {
      slug: "vanilla-plus",
      name: "Vanilla Plus",
      ramMb: 4096,
      cpuPercent: 200,
      diskMb: 20480,
      priceMonthlyCents: 999,
      features: [
        t(lang, "pricing.feature.instant"),
        t(lang, "pricing.feature.vanilla"),
        t(lang, "pricing.feature.nvme"),
        t(lang, "pricing.feature.ddos"),
        `${t(lang, "pricing.feature.databases")}: 2`,
        `${t(lang, "pricing.feature.backups")}: 2`,
      ],
    },
    {
      slug: "vanilla-pro",
      name: "Vanilla Pro",
      ramMb: 8192,
      cpuPercent: 300,
      diskMb: 30720,
      priceMonthlyCents: 1499,
      features: [
        t(lang, "pricing.feature.instant"),
        t(lang, "pricing.feature.vanilla"),
        t(lang, "pricing.feature.nvme"),
        t(lang, "pricing.feature.ddos"),
        `${t(lang, "pricing.feature.databases")}: 3`,
        `${t(lang, "pricing.feature.backups")}: 3`,
      ],
    },
  ];
}

export default async function PricingPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";
  const hasSession = Boolean(await getAccessTokenFromCookies());

  const dbConfigured = Boolean(process.env.DATABASE_URL);

  const plans: PricingPlan[] = dbConfigured
    ? await prisma.plan.findMany({
        where: { active: true },
        orderBy: { priceMonthlyCents: "asc" },
      })
    : fallbackPlans(lang);
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Cloudsting Minecraft hosting plans",
    url: absoluteUrl("/pricing"),
    itemListElement: plans.map((plan, index) => ({
      "@type": "Offer",
      position: index + 1,
      url: absoluteUrl(`/checkout/${plan.slug}`),
      priceCurrency: "USD",
      price: (plan.priceMonthlyCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      itemOffered: {
        "@type": "Product",
        name: plan.name,
        description: `${Math.round(plan.ramMb / 1024)} GB RAM, ${plan.cpuPercent}% CPU, ${Math.round(plan.diskMb / 1024)} GB NVMe SSD`,
      },
    })),
  };
  const comparisonBlocks = isEs
    ? [
        {
          title: "Hosting gratis para empezar",
          body: "Si estás montando una comunidad pequeña o quieres validar una idea, el hosting gratis sirve para aprender, testear plugins y lanzar un mundo privado. Cuando ya necesitas más estabilidad o jugadores concurrentes, toca pasar a un plan con más RAM, CPU y mejores backups.",
          href: "/free-minecraft-hosting",
          cta: "Ver hosting gratis",
        },
        {
          title: "Hosting modded con recursos reales",
          body: "Los modpacks pesados penalizan CPU, RAM y disco. Si vas a usar Forge, Fabric o packs con generación agresiva de chunks, necesitas mirar algo más que el precio mensual. Esta guía te orienta para no comprar de menos.",
          href: "/modded-minecraft-hosting",
          cta: "Ver hosting modded",
        },
        {
          title: "Cómo elegir el plan correcto",
          body: "No todos los proyectos necesitan el mismo servidor. La mejor compra depende del número de jugadores, el tipo de software, si usas mods o plugins, y cuánto te importa la migración futura.",
          href: "/guides/choose-minecraft-hosting",
          cta: "Leer guía",
        },
      ]
    : [
        {
          title: "Free hosting to get started",
          body: "If you are building a small community or testing an idea, free hosting is enough for early experiments, plugins, and private worlds. Once you need stronger stability or more concurrent players, you need more RAM, CPU, and recovery options.",
          href: "/free-minecraft-hosting",
          cta: "See free hosting",
        },
        {
          title: "Modded hosting with real headroom",
          body: "Heavy modpacks stress CPU, RAM, and storage. If you plan to run Forge, Fabric, or chunk-heavy packs, price alone is not a good buying signal. This page helps you size infrastructure correctly.",
          href: "/modded-minecraft-hosting",
          cta: "See modded hosting",
        },
        {
          title: "How to choose the right plan",
          body: "The best purchase depends on player count, software stack, mods versus plugins, and how much future scaling matters for your project.",
          href: "/guides/choose-minecraft-hosting",
          cta: "Read guide",
        },
      ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      <Container className="py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">
            {t(lang, "pricing.heroA")} <span className="text-[#1AD76F]">{t(lang, "pricing.heroB")}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-gray-400">
            {t(lang, "pricing.sub")}
          </p>
        </div>

        {!dbConfigured ? (
          <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface1)] p-5">
            <div className="text-sm font-semibold">{t(lang, "pricing.dbNotConfigured")}</div>
            <div className="mt-1 text-sm text-[color:var(--muted)]">
              {t(lang, "pricing.dbNotConfiguredHintA")} {" "}
              <span className="font-semibold text-[color:var(--text)]">DATABASE_URL</span> {" "}
              {t(lang, "pricing.dbNotConfiguredHintB")} {" "}
              <span className="font-semibold text-[color:var(--text)]">.env.local</span> {" "}
              {t(lang, "pricing.dbNotConfiguredHintC")}
            </div>
          </div>
        ) : null}

        {!hasSession ? (
          <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface1)] p-5">
            <div className="text-sm font-semibold">{t(lang, "pricing.accountRequired")}</div>
            <div className="mt-1 text-sm text-[color:var(--muted)]">
              {t(lang, "pricing.please")} {" "}
              <Link href="/login" className="text-[color:var(--accent)]">{t(lang, "auth.login")}</Link> {" "}
              {t(lang, "pricing.or")} {" "}
              <Link href="/register" className="text-[color:var(--accent)]">{t(lang, "auth.register")}</Link> {" "}
              {t(lang, "pricing.beforeCheckout")}
            </div>
          </div>
        ) : null}

        <PricingClientGrid plans={plans} canCheckout={dbConfigured && hasSession} />

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {comparisonBlocks.map((block) => (
            <Card key={block.href} className="p-6">
              <h2 className="text-lg font-extrabold text-[color:var(--text)]">{block.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{block.body}</p>
              <Link href={block.href} className="mt-5 inline-flex text-sm font-bold text-[color:var(--accent)]">
                {block.cta}
              </Link>
            </Card>
          ))}
        </div>
      </Container>
    </main>
  );
}
