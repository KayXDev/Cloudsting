import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { LogoutButton } from "@/components/LogoutButton";
import { t } from "@/lib/i18n";
import { createMetadata } from "@/lib/seo";
import { requireUser } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Dashboard",
    description: "Manage your Cloudsting Minecraft servers, account access, and active hosting resources.",
    path: "/dashboard",
    noIndex: true,
  });
}

export default async function DashboardPage() {
  const lang = getLanguageFromCookies();
  const serverIcons = ["🦇", "🕷️", "🟩", "💀"] as const;
  let user: { id: string; email: string; role: "USER" | "ADMIN" };

  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  const servers = await prisma.server.findMany({
    where: { userId: user.id, status: { notIn: ["DELETED", "ERROR"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      memoryMb: true,
      cpuPercent: true,
      diskMb: true,
      planId: true,
      pterodactylIdentifier: true,
    },
  });

  const planIds = Array.from(new Set(servers.map((server) => server.planId).filter(Boolean)));
  const plans = planIds.length
    ? await prisma.plan.findMany({
        where: { id: { in: planIds } },
        select: { id: true, name: true },
      })
    : [];
  const planMap = new Map(plans.map((plan) => [plan.id, plan]));
  const panelBaseUrl = env.PTERO_URL ? env.PTERO_URL.replace(/\/$/, "") : null;

  return (
    <main>
      <Container className="py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "dashboard.title")}</h1>
            <div className="mt-2 text-sm text-[color:var(--muted)]">
              {t(lang, "dashboard.signedInAs").replace("{email}", user.email)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface1)] px-4 py-2 text-sm font-semibold hover:bg-[color:var(--surface2)]"
              >
                {t(lang, "dashboard.adminPanel")}
              </Link>
            ) : null}
            <LogoutButton />
          </div>
        </div>

        <div className="mt-10 grid gap-4">
          {servers.length === 0 ? (
            <Card className="p-6">
              <div className="text-sm font-extrabold">{t(lang, "dashboard.empty.title")}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "dashboard.empty.subtitle")}</div>
              <div className="mt-6">
                <Link
                  href="/pricing"
                  className="inline-flex rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)] hover:brightness-110"
                >
                  {t(lang, "dashboard.empty.cta")}
                </Link>
              </div>
            </Card>
          ) : null}

          <div className="mx-auto grid max-w-[1160px] gap-4">
          {servers.map((server, index) => {
            const panelHref = panelBaseUrl && server.pterodactylIdentifier
              ? `${panelBaseUrl}/server/${server.pterodactylIdentifier}`
              : null;
            const translatedStatus = (() => {
              const key = `serverStatus.${server.status}`;
              const translated = t(lang, key);
              return translated === key ? server.status : translated;
            })();
            const planName = planMap.get(server.planId)?.name ?? t(lang, "common.planUnavailable");

            return (
              <div
                key={server.id}
                className="mx-auto w-full max-w-[880px] overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[linear-gradient(180deg,rgba(16,16,16,0.98),rgba(10,10,10,0.98))] p-5 backdrop-blur-md transition hover:border-[#2f2f2f]"
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-[#1AD76F]/90" />

                <div className="grid gap-4 lg:grid-cols-[minmax(0,250px),minmax(0,1fr),180px] lg:items-center">
                  <div className="min-w-0">
                    <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2b2b2b] bg-[#171717] text-lg">
                      {serverIcons[index % serverIcons.length]}
                    </div>

                    <div className="truncate text-xl font-extrabold text-white">{server.name}</div>
                    <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-gray-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#1AD76F]" />
                      {planName}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-[#2d2d2d] bg-[#171717] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                        {translatedStatus}
                      </span>
                      <span className="text-xs text-gray-500">{t(lang, "dashboard.server.status")}</span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="my-3 h-px bg-[#272727] lg:hidden" />
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl border border-[#2a2a2a] bg-[#151515] px-3 py-2.5">
                        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500">RAM</div>
                        <div className="mt-1 text-sm font-bold text-white">{t(lang, "pricing.spec.ram").replace("{gb}", String(server.memoryMb / 1024))}</div>
                      </div>
                      <div className="rounded-xl border border-[#2a2a2a] bg-[#151515] px-3 py-2.5">
                        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500">Disk</div>
                        <div className="mt-1 text-sm font-bold text-white">{t(lang, "pricing.spec.disk").replace("{gb}", String(Math.round(server.diskMb / 1024)))}</div>
                      </div>
                      <div className="rounded-xl border border-[#2a2a2a] bg-[#151515] px-3 py-2.5">
                        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500">CPU</div>
                        <div className="mt-1 text-sm font-bold text-white">{t(lang, "pricing.spec.cpu").replace("{pct}", String(server.cpuPercent))}</div>
                      </div>
                      <div className="rounded-xl border border-[#2a2a2a] bg-[#151515] px-3 py-2.5">
                        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500">{t(lang, "dashboard.server.type")}</div>
                        <div className="mt-1 truncate text-sm font-bold text-white">{planName}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-2 lg:items-end">
                    {panelHref ? (
                      <a
                        href={panelHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-xl bg-[#1AD76F] px-4 py-3 text-sm font-extrabold text-black transition hover:bg-[#18c263] lg:w-[170px]"
                      >
                        {lang === "es" ? "Ir al panel" : "Open panel"}
                      </a>
                    ) : (
                      <div className="inline-flex w-full items-center justify-center rounded-xl border border-[#2b2b2b] px-4 py-3 text-sm font-bold text-gray-500 lg:w-[170px]">
                        {lang === "es" ? "Panel no disponible" : "Panel unavailable"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </Container>
    </main>
  );
}
