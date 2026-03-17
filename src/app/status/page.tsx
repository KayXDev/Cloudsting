import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { createMetadata } from "@/lib/seo";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { syncNodesFromPterodactyl } from "@/server/stock";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export const metadata: Metadata = createMetadata({
  title: "Platform Status",
  description: "Check Cloudsting live platform health, API availability, database connectivity, node sync, and active server metrics.",
  path: "/status",
  keywords: ["minecraft hosting status", "cloudsting status", "server status page"],
});

export default async function StatusPage() {
  const lang = getLanguageFromCookies();
  let apiOk = false;
  let dbOk = false;
  let pteroOk = false;

  const appUrl = env.APP_URL.replace(/\/$/, "");

  try {
    const res = await fetch(`${appUrl}/api/health`, {
      cache: "no-store",
    });
    apiOk = res.ok;
  } catch {
    apiOk = false;
  }

  try {
    await prisma.user.count();
    dbOk = true;
  } catch {
    dbOk = false;
  }

  if (env.PTERO_URL && env.PTERO_APPLICATION_API_KEY) {
    try {
      await syncNodesFromPterodactyl();
      pteroOk = true;
    } catch {
      pteroOk = false;
    }
  }

  const [nodes, serversTotal, serversActive] = await Promise.all([
    prisma.node.findMany({ orderBy: { pterodactylNodeId: "asc" } }),
    prisma.server.count({ where: { status: { notIn: ["DELETED", "ERROR"] } } }),
    prisma.server.count({ where: { status: "ACTIVE" } }),
  ]);

  const totalMemoryMb = nodes.reduce((sum, n) => sum + n.totalMemoryMb, 0);
  const usedMemoryMb = nodes.reduce((sum, n) => sum + n.usedMemoryMb, 0);
  const memoryPercent = totalMemoryMb > 0 ? Math.round((usedMemoryMb / totalMemoryMb) * 100) : 0;

  return (
    <main>
      <Container className="py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "status.title")}</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {t(lang, "status.subtitle")}
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="text-sm font-semibold">{t(lang, "status.api.title")}</div>
            <div className={`mt-3 text-2xl font-extrabold ${apiOk ? "text-[color:var(--accent)]" : "text-[color:var(--danger)]"}`}>
              {apiOk ? t(lang, "status.state.operational") : t(lang, "status.state.degraded")}
            </div>
            <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "status.api.hint")}</div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-semibold">{t(lang, "status.db.title")}</div>
            <div className={`mt-3 text-2xl font-extrabold ${dbOk ? "text-[color:var(--accent)]" : "text-[color:var(--danger)]"}`}>
              {dbOk ? t(lang, "status.state.connected") : t(lang, "status.state.unavailable")}
            </div>
            <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "status.db.hint")}</div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-semibold">{t(lang, "status.panel.title")}</div>
            <div className={`mt-3 text-2xl font-extrabold ${pteroOk ? "text-[color:var(--accent)]" : "text-[color:var(--danger)]"}`}>
              {pteroOk ? t(lang, "status.state.online") : t(lang, "status.state.unavailable")}
            </div>
            <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "status.panel.hint")}</div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-semibold">{t(lang, "status.activeServers.title")}</div>
            <div className="mt-3 text-2xl font-extrabold text-[color:var(--accent2)]">{serversActive}/{serversTotal}</div>
            <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "status.activeServers.hint")}</div>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <div className="text-sm font-semibold">{t(lang, "status.nodes.title")}</div>
            <div className="mt-2 text-2xl font-extrabold">{nodes.length}</div>
            <div className="mt-2 text-sm text-[color:var(--muted)]">
              {t(lang, "status.nodes.inDb").replace(
                "{list}",
                nodes.map((n) => `#${n.pterodactylNodeId}`).join(", ") || t(lang, "common.none")
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-semibold">{t(lang, "status.ram.title")}</div>
            <div className="mt-2 text-2xl font-extrabold">{memoryPercent}%</div>
            <div className="mt-2 text-sm text-[color:var(--muted)]">
              {t(lang, "status.ram.hint")
                .replace("{used}", String(Math.round(usedMemoryMb / 1024)))
                .replace("{total}", String(Math.round(totalMemoryMb / 1024)))}
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}
