import { Card } from "@/components/Card";
import { AdminPlanPriceEditor } from "@/components/AdminPlanPriceEditor";
import { t } from "@/lib/i18n";
import { prisma } from "@/server/db";
import { getLanguageFromCookies } from "@/server/i18n";

export default async function AdminPlansPage() {
  const lang = getLanguageFromCookies();
  const plans = await prisma.plan.findMany({ orderBy: { priceMonthlyCents: "asc" } });

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-extrabold">{t(lang, "admin.plans.title")}</div>
        <div className="text-xs text-[color:var(--muted)]">{t(lang, "admin.plans.count").replace("{count}", String(plans.length))}</div>
      </div>

      <div className="grid gap-3 text-sm text-[color:var(--muted)]">
        {plans.map((p) => (
          <div key={p.id} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-[color:var(--text)]">{p.name}</div>
              <div className="text-xs">${(p.priceMonthlyCents / 100).toFixed(2)}{t(lang, "common.perMonth")}</div>
            </div>
            <div className="mt-1 text-xs">
              {(p.active ? t(lang, "common.enabled") : t(lang, "common.disabled"))} • {t(lang, "common.resources")
                .replace("{ram}", String(p.ramMb / 1024))
                .replace("{cpu}", String(p.cpuPercent))
                .replace("{disk}", String(Math.round(p.diskMb / 1024)))}
            </div>
            <div className="mt-3">
              <AdminPlanPriceEditor
                slug={p.slug}
                name={p.name}
                currentPriceMonthlyCents={p.priceMonthlyCents}
                ramMb={p.ramMb}
                cpuPercent={p.cpuPercent}
                diskMb={p.diskMb}
                databasesLimit={(p as any).databasesLimit ?? 0}
                backupsLimit={(p as any).backupsLimit ?? 0}
                allocationsLimit={(p as any).allocationsLimit ?? 1}
                active={Boolean((p as any).active)}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
