import { prisma } from "@/server/db";
import { pingMinecraftStatus } from "@/server/minecraft/ping";

export type PublicStats = {
  users: number;
  serversOnline: number;
  playersOnline: number;
};

type CacheEntry = {
  at: number;
  data: PublicStats;
  inFlight?: Promise<PublicStats>;
};

declare global {
  // eslint-disable-next-line no-var
  var __kxPublicStatsCache: CacheEntry | undefined;
}

function limitConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]!);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  return Promise.all(workers).then(() => results);
}

function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function getPublicStats(opts?: { cacheTtlMs?: number }): Promise<PublicStats> {
  const cacheTtlMs = opts?.cacheTtlMs ?? 2 * 60_000;

  const cached = globalThis.__kxPublicStatsCache;
  const ageMs = cached ? Date.now() - cached.at : Number.POSITIVE_INFINITY;
  const isFresh = cached && ageMs < cacheTtlMs;

  if (isFresh) return cached.data;

  // If we have a stale value, return it immediately and refresh in the background.
  if (cached && !isFresh) {
    if (!cached.inFlight) {
      cached.inFlight = computePublicStats(cacheTtlMs)
        .then((data) => {
          globalThis.__kxPublicStatsCache = { at: Date.now(), data };
          return data;
        })
        .catch(() => {
          // Keep stale data if refresh fails.
          return cached.data;
        })
        .finally(() => {
          const current = globalThis.__kxPublicStatsCache;
          if (current) current.inFlight = undefined;
        });
    }
    return cached.data;
  }

  // No cache yet: compute once.
  const data = await computePublicStats(cacheTtlMs);
  globalThis.__kxPublicStatsCache = { at: Date.now(), data };
  return data;
}

async function computePublicStats(_cacheTtlMs: number): Promise<PublicStats> {
  if (!isDbConfigured()) {
    return { users: 0, serversOnline: 0, playersOnline: 0 };
  }

  // Base counts (DB)
  const usersPromise = prisma.user.count().catch(() => 0);

  // Only consider purchased + active servers for public stats.
  const serversPromise = prisma.server
    .findMany({
      where: {
        orderId: { not: null },
        status: "ACTIVE",
        pterodactylIdentifier: { not: null },
      },
      select: { pterodactylIdentifier: true },
      take: 1000,
    })
    .catch(() => [] as Array<{ pterodactylIdentifier: string | null }>);

  const [users, servers] = await Promise.all([usersPromise, serversPromise]);

  // NOTE: Host scheme is configurable via env so it matches your infra.
  // The app will ping: <identifier><MC_PUBLIC_HOST_SUFFIX>:<MC_PUBLIC_DEFAULT_PORT>
  const suffixRaw = String(process.env.MC_PUBLIC_HOST_SUFFIX ?? ".mcsh.io").trim();
  const hostSuffix = suffixRaw.startsWith(".") ? suffixRaw : `.${suffixRaw}`;
  const portRaw = Number(process.env.MC_PUBLIC_DEFAULT_PORT ?? 25565);
  const defaultPort = Number.isFinite(portRaw) && portRaw > 0 ? Math.floor(portRaw) : 25565;

  const candidates = servers
    .map((s) => String(s.pterodactylIdentifier ?? "").trim())
    .filter(Boolean)
    .map((identifier) => ({ host: `${identifier}${hostSuffix}`, port: defaultPort }));

  const results = await limitConcurrency(candidates, 50, async ({ host, port }) => {
    try {
      const status = await pingMinecraftStatus(host, port, 800);
      const online = Number(status?.players?.online ?? 0);
      return { ok: true as const, playersOnline: Number.isFinite(online) ? Math.max(0, Math.floor(online)) : 0 };
    } catch {
      return { ok: false as const, playersOnline: 0 };
    }
  });

  const serversOnline = results.reduce((acc, r) => acc + (r.ok ? 1 : 0), 0);
  const playersOnline = results.reduce((acc, r) => acc + (r.ok ? r.playersOnline : 0), 0);

  return {
    users,
    serversOnline,
    playersOnline,
  };
}
