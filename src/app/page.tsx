import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { PricingClientGrid, type PricingPlan } from "@/components/PricingClientGrid";
import { prisma } from "@/server/db";
import { getLanguageFromCookies } from "@/server/i18n";
import { getPublicStats } from "@/server/publicStats";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Home() {
  const lang = getLanguageFromCookies();

  const numberFmt = new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-US");
  const compactFmt = new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  function formatStat(n: number) {
    const value = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    if (value >= 10_000) return compactFmt.format(value);
    return numberFmt.format(value);
  }

  const features = [
    {
      title: t(lang, "home.feature.instant.title"),
      description: t(lang, "home.feature.instant.desc"),
    },
    {
      title: t(lang, "home.feature.ryzen.title"),
      description: t(lang, "home.feature.ryzen.desc"),
    },
    {
      title: t(lang, "home.feature.nvme.title"),
      description: t(lang, "home.feature.nvme.desc"),
    },
    {
      title: t(lang, "home.feature.ddos.title"),
      description: t(lang, "home.feature.ddos.desc"),
    },
    {
      title: t(lang, "home.feature.modpacks.title"),
      description: t(lang, "home.feature.modpacks.desc"),
    },
    {
      title: t(lang, "home.feature.backups.title"),
      description: t(lang, "home.feature.backups.desc"),
    },
  ];

  const dbConfigured = Boolean(process.env.DATABASE_URL);

  const plans: PricingPlan[] = dbConfigured
    ? await prisma.plan.findMany({ where: { active: true }, orderBy: { priceMonthlyCents: "asc" } })
    : [];

  const stats = await getPublicStats().catch(() => ({ users: 0, serversOnline: 0, playersOnline: 0 }));

  return (
    <main>
      <section className="home-hero-bg relative overflow-hidden">
        <div className="home-hero-stars" />
        <div className="home-hero-stars-2" />
        <div className="home-hero-vignette" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(860px_circle_at_50%_8%,rgba(95,255,173,0.17),transparent_50%)]" />
        <Container className="py-18 md:py-22">
          <div className="relative z-[1] grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <div className="kx-fade-up">
              <Image
                src="/kx-minecraft-mark.svg"
                alt="Cloudsting"
                width={84}
                height={72}
                className="mb-3 block"
                priority
              />

              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface1)] px-4 py-2 text-xs font-semibold text-[color:var(--muted)]">
                <span className="h-2 w-2 rounded-full bg-[color:var(--accent)]" />
                {t(lang, "home.pill")}
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-6xl">
                {t(lang, "home.h1a")}
                <span className="block text-[color:var(--accent)]">{t(lang, "home.h1b")}</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--muted)]">
                {t(lang, "home.p")}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/pricing"
                  className="rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-extrabold text-[color:var(--bg)] shadow-[0_10px_30px_rgba(89,255,168,0.3)] hover:brightness-110"
                >
                  {t(lang, "home.ctaCreate")}
                </Link>
                <Link
                  href="/features"
                  className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface1)] px-5 py-3 text-sm font-bold text-[color:var(--text)] hover:bg-[color:var(--surface2)]"
                >
                  {t(lang, "home.ctaDiscord")}
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-xs text-[color:var(--muted)]">
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface1)] px-3 py-1">
                  <span className="kx-online-dot h-2 w-2 rounded-full bg-[color:var(--accent)]" aria-hidden="true" />
                  {formatStat(stats.playersOnline)} {t(lang, "home.stats.playersOnline")}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface1)] px-3 py-1">
                  <span className="kx-online-dot h-2 w-2 rounded-full bg-[color:var(--accent)]" aria-hidden="true" />
                  {formatStat(stats.serversOnline)} {t(lang, "home.stats.serversOnline")}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface1)] px-3 py-1">
                  <span className="kx-online-dot h-2 w-2 rounded-full bg-[color:var(--accent)]" aria-hidden="true" />
                  {formatStat(stats.users)} {t(lang, "home.stats.users")}
                </div>
              </div>
            </div>

            <Card className="kx-fade-up-delay-1 p-6 md:p-8">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--accent2)]">{t(lang, "home.liveStats")}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">
                {t(lang, "home.liveStatsSubtitle")}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  { label: t(lang, "home.stat.uptimeTarget"), value: "99.99%" },
                  { label: t(lang, "home.stat.storage"), value: "NVMe" },
                  { label: t(lang, "home.stat.deployTime"), value: "< 60s" },
                  { label: t(lang, "home.stat.protection"), value: "L3-L7" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] p-4">
                    <div className="text-xs text-[color:var(--muted)]">{s.label}</div>
                    <div className="mt-1 text-xl font-extrabold text-[color:var(--text)]">{s.value}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <section className="border-y border-[color:var(--border)]">
        <Container className="py-14">
          <div className="mb-6 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">{t(lang, "home.plansTitle")}</h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "home.plansSubtitle")}</p>
            </div>
            <Link
              href="/pricing"
              className="hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface1)] px-4 py-2 text-sm font-semibold hover:bg-[color:var(--surface2)] md:inline-block"
            >
              {t(lang, "home.seeAllPlans")}
            </Link>
          </div>

          {plans.length > 0 ? (
            <PricingClientGrid plans={plans} canCheckout={true} />
          ) : (
            <Card className="p-6 text-center">
              <div className="text-sm font-bold">{t(lang, "home.noPlansTitle")}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">
                {t(lang, "home.noPlansSubtitle")}
              </div>
            </Card>
          )}

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {features.slice(0, 3).map((f) => (
              <Card key={f.title} className="p-4">
                <div className="text-sm font-extrabold">{f.title}</div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">{f.description}</div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
