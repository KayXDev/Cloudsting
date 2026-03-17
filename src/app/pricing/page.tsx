import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PricingClientGrid, type PricingPlan } from "@/components/PricingClientGrid";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import { prisma } from "@/server/db";
import { getAccessTokenFromCookies } from "@/server/auth/session";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Minecraft Hosting Pricing",
  description:
    "Compare Cloudsting Minecraft hosting plans with instant deployment, NVMe SSD storage, DDoS protection, and flexible resources.",
  path: "/pricing",
  keywords: ["minecraft pricing", "minecraft hosting plans", "budget minecraft hosting"],
});

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
      </Container>
    </main>
  );
}
