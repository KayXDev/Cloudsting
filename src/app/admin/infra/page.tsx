import { Card } from "@/components/Card";
import { AdminSyncNodesButton } from "@/components/AdminSyncNodesButton";
import { t } from "@/lib/i18n";
import { prisma } from "@/server/db";
import { getLanguageFromCookies } from "@/server/i18n";

export default async function AdminInfraPage() {
  const lang = getLanguageFromCookies();
  const nodes = await prisma.node.findMany({ orderBy: { pterodactylNodeId: "asc" } });

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-extrabold">{t(lang, "admin.infra.title")}</div>
        <AdminSyncNodesButton />
      </div>

      <div className="grid gap-2 text-sm text-[color:var(--muted)]">
        {nodes.length === 0 ? (
          <div>{t(lang, "admin.infra.empty")}</div>
        ) : (
          nodes.map((n) => (
            <div key={n.id} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[color:var(--text)]">{n.name}</div>
                <div className="text-xs">#{n.pterodactylNodeId}</div>
              </div>
              <div className="mt-1 text-xs">
                {t(lang, "admin.infra.resources")
                  .replace("{ramUsed}", String(n.usedMemoryMb))
                  .replace("{ramTotal}", String(n.totalMemoryMb))
                  .replace("{diskUsed}", String(n.usedDiskMb))
                  .replace("{diskTotal}", String(n.totalDiskMb))}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
