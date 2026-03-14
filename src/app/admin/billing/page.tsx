import { Card } from "@/components/Card";
import { t } from "@/lib/i18n";
import { prisma } from "@/server/db";
import { getLanguageFromCookies } from "@/server/i18n";

export default async function AdminBillingPage() {
  const lang = getLanguageFromCookies();
  const [orders, plans] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 120,
      include: { user: { select: { email: true } } },
    }),
    prisma.plan.findMany({ select: { id: true, name: true } }),
  ]);

  const planById = new Map(plans.map((p) => [p.id, p.name]));

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-extrabold">{t(lang, "admin.billing.title")}</div>
        <div className="text-xs text-[color:var(--muted)]">{t(lang, "admin.billing.count").replace("{count}", String(orders.length))}</div>
      </div>

      {orders.length === 0 ? (
        <div className="text-sm text-[color:var(--muted)]">{t(lang, "admin.billing.empty")}</div>
      ) : (
        <div className="grid gap-2 text-sm text-[color:var(--muted)]">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-2"
            >
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-[color:var(--text)]">{o.user.email}</div>
                  <div className="mt-1 text-xs">
                    {(planById.get(o.planId) ?? t(lang, "common.unknownPlan"))} • {o.provider} • ${(o.amountCents / 100).toFixed(2)} • {o.status}
                  </div>
                </div>
                <div className="text-xs">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
