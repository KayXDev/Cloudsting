import { Card } from "@/components/Card";
import { AdminServersManager } from "@/components/AdminServersManager";
import { t } from "@/lib/i18n";
import { prisma } from "@/server/db";
import { getLanguageFromCookies } from "@/server/i18n";

export default async function AdminServersPage() {
  const lang = getLanguageFromCookies();
  const [servers, plans] = await Promise.all([
    prisma.server.findMany({
      where: { status: { not: "DELETED" } },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        userId: true,
        planId: true,
        name: true,
        status: true,
        pterodactylIdentifier: true,
        memoryMb: true,
        cpuPercent: true,
        diskMb: true,
      },
    }),
    prisma.plan.findMany({ select: { id: true, slug: true } }),
  ]);

  const planById = new Map(plans.map((p) => [p.id, p.slug]));
  const userIds = Array.from(new Set(servers.map((server) => server.userId)));
  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true },
      })
    : [];
  const userEmailById = new Map(users.map((user) => [user.id, user.email]));
  const panelUrl = process.env.NEXT_PUBLIC_PTERO_PANEL_URL ?? process.env.PTERO_URL ?? "";

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-extrabold">{t(lang, "admin.servers.title")}</div>
        <div className="text-xs text-[color:var(--muted)]">{t(lang, "admin.servers.count").replace("{count}", String(servers.length))}</div>
      </div>

      <AdminServersManager
        panelUrl={panelUrl}
        rows={servers.map((s) => ({
          id: s.id,
          name: s.name,
          status: s.status,
          userEmail: userEmailById.get(s.userId) ?? `Deleted user (${s.userId})`,
          planSlug: planById.get(s.planId) ?? "unknown",
          pterodactylIdentifier: s.pterodactylIdentifier ?? null,
          memoryMb: s.memoryMb,
          cpuPercent: s.cpuPercent,
          diskMb: s.diskMb,
        }))}
      />
    </Card>
  );
}
