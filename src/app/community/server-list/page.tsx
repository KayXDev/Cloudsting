import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ServerStatus } from "@prisma/client";
import { Container } from "@/components/Container";
import { prisma } from "@/server/db";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: {
    q?: string;
  };
};

function statusPill(status: string) {
  if (status === "ACTIVE") return "bg-[#1AD76F] text-black";
  return "bg-[#3a3a3a] text-white";
}

function maskOwner(email: string) {
  const username = email.split("@")[0] ?? "user";
  if (username.length <= 3) return `${username}***`;
  return `${username.slice(0, 3)}***`;
}

function bannerBackground(seed: string, index: number) {
  const value = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + index * 7;
  const hue = (value % 35) + 20;
  return {
    backgroundImage: `
      linear-gradient(90deg, rgba(0,0,0,0.58), rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.45)),
      repeating-linear-gradient(90deg, hsl(${hue} 36% 20%) 0 18px, hsl(${hue + 8} 33% 17%) 18px 36px),
      repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 12px, rgba(255,255,255,0.02) 12px 24px)
    `,
  } as const;
}

export default async function CommunityServerListPage({ searchParams }: PageProps) {
  const lang = getLanguageFromCookies();
  const q = (searchParams?.q ?? "").trim();
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  const visibleStatuses: ServerStatus[] = [ServerStatus.ACTIVE];

  if (!dbConfigured) {
    return (
      <main>
        <Container className="py-14">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface1)] p-6">
            <h1 className="text-2xl font-extrabold">{t(lang, "community.serverList.title")}</h1>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              {t(lang, "community.serverList.dbNotConfigured")}
            </p>
          </div>
        </Container>
      </main>
    );
  }

  const serverWhere: Prisma.ServerWhereInput = {
    orderId: { not: null },
    status: { in: visibleStatuses },
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
          ],
        }
      : {}),
  };

  const [servers, activeServers, ownersWithServers] = await Promise.all([
    prisma.server.findMany({
      where: serverWhere,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        status: true,
        pterodactylIdentifier: true,
        memoryMb: true,
        diskMb: true,
        planId: true,
        userId: true,
      },
      take: 100,
    }),
    prisma.server.count({ where: { orderId: { not: null }, status: ServerStatus.ACTIVE } }),
    prisma.user.count({ where: { servers: { some: { orderId: { not: null }, status: ServerStatus.ACTIVE } } } }),
  ]);

  const planIds = Array.from(new Set(servers.map((s) => s.planId).filter(Boolean)));
  const userIds = Array.from(new Set(servers.map((s) => s.userId).filter(Boolean)));

  const [plans, owners] = await Promise.all([
    planIds.length
      ? prisma.plan.findMany({
          where: { id: { in: planIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    userIds.length
      ? prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true },
        })
      : Promise.resolve([]),
  ]);

  const planMap = new Map(plans.map((p) => [p.id, p.name]));
  const ownerMap = new Map(owners.map((u) => [u.id, u.email]));

  return (
    <main>
      <Container className="py-10">
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="rounded-2xl border border-[#232323] bg-[#0d0d0d] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <form action="/community/server-list" method="get" className="flex-1">
                <div className="flex items-center gap-2 rounded-xl border border-[#232323] bg-[#090909] px-3 py-2.5">
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-gray-500" fill="none" aria-hidden="true">
                    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M13.5 13.5L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input
                    name="q"
                    defaultValue={q}
                    placeholder={t(lang, "community.serverList.searchPlaceholder")}
                    className="w-full bg-transparent text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none"
                  />
                </div>
              </form>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl bg-[#1AD76F] px-4 py-2.5 text-sm font-extrabold text-black hover:bg-[#17c263]"
              >
                {t(lang, "community.serverList.createServer")}
              </Link>
            </div>

            <div className="mt-4 grid gap-3">
              {servers.length === 0 ? (
                <div className="rounded-xl border border-[#232323] bg-[#111111] p-5 text-sm text-[color:var(--muted)]">
                  {t(lang, "community.serverList.empty")}
                </div>
              ) : null}

              {servers.map((s, index) => {
                const serverHost = s.pterodactylIdentifier ? `${s.pterodactylIdentifier}.mcsh.io` : "pending.mcsh.io";
                const serverIp = `${serverHost}:25565`;

                return (
                  <div key={s.id} className="grid gap-3 rounded-xl border border-[#232323] bg-[#121212] p-3 md:grid-cols-[30px_1fr_auto] md:items-center">
                    <div className="text-center text-sm font-extrabold text-gray-500">{index + 1}</div>

                    <div className="overflow-hidden rounded-lg border border-[#242424] bg-[#151515]">
                      <div className="px-3 py-2 text-[11px] text-gray-300" style={bannerBackground(s.name, index)}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-extrabold text-white">{s.name}</span>
                          <span className="rounded-md bg-[#111111]/75 px-2 py-0.5 text-[10px] font-bold text-[#9aeec3]">{t(lang, "community.serverList.ip").replace("{ip}", serverIp)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 px-3 py-2 text-xs text-gray-400">
                        <span className="rounded-md border border-[#2b2b2b] bg-[#171717] px-2 py-0.5">{planMap.get(s.planId) ?? t(lang, "common.planUnavailable")}</span>
                        <span className="rounded-md border border-[#2b2b2b] bg-[#171717] px-2 py-0.5">{t(lang, "community.serverList.owner").replace("{owner}", maskOwner(ownerMap.get(s.userId) ?? "user"))}</span>
                        <span className="rounded-md border border-[#2b2b2b] bg-[#171717] px-2 py-0.5">{t(lang, "common.ramGb").replace("{gb}", String(Math.round(s.memoryMb / 1024)))}</span>
                        <span className="rounded-md border border-[#2b2b2b] bg-[#171717] px-2 py-0.5">{t(lang, "common.ssdGb").replace("{gb}", String(Math.round(s.diskMb / 1024)))}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:flex-col md:items-end">
                      <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${statusPill(s.status)}`}>{t(lang, "community.serverList.online")}</span>
                      <button type="button" className="rounded-md bg-[#1AD76F] px-3 py-1.5 text-xs font-extrabold text-black hover:bg-[#17c363]">
                        {t(lang, "community.serverList.copyIp")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="h-max rounded-2xl border border-[#232323] bg-[#0f0f0f] p-4 lg:sticky lg:top-24">
            <div className="rounded-xl bg-[#1AD76F] px-3 py-2 text-sm font-extrabold text-black">
              {t(lang, "community.serverList.statsTitle")}
            </div>

            <div className="mt-3 grid gap-3">
              <div className="rounded-xl border border-[#2a2a2a] bg-[#121212] p-3">
                <div className="text-xs text-gray-400">{t(lang, "community.serverList.stats.activeServers")}</div>
                <div className="mt-1 text-2xl font-extrabold text-[#1AD76F]">{activeServers}</div>
              </div>

              <div className="rounded-xl border border-[#2a2a2a] bg-[#121212] p-3">
                <div className="text-xs text-gray-400">{t(lang, "community.serverList.stats.owners")}</div>
                <div className="mt-1 text-2xl font-extrabold text-[#e8ecef]">{ownersWithServers}</div>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
