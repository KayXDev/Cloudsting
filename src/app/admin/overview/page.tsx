import Link from "next/link";
import { Card } from "@/components/Card";
import { t } from "@/lib/i18n";
import { prisma } from "@/server/db";
import { getLanguageFromCookies } from "@/server/i18n";

export default async function AdminOverviewPage() {
  const lang = getLanguageFromCookies();
  const [usersCount, serversCount, activeServers, suspendedServers, plansCount, activePlans, orders] =
    await Promise.all([
      prisma.user.count(),
      prisma.server.count({ where: { status: { not: "DELETED" } } }),
      prisma.server.count({ where: { status: "ACTIVE" } }),
      prisma.server.count({ where: { status: "SUSPENDED" } }),
      prisma.plan.count(),
      prisma.plan.count({ where: { active: true } }),
      prisma.order.findMany({ where: { status: "PAID" }, select: { amountCents: true } }),
    ]);

  const revenue = orders.reduce((acc, o) => acc + o.amountCents, 0);

  const cards = [
    { title: t(lang, "admin.overview.cards.users.title"), value: usersCount, hint: t(lang, "admin.overview.cards.users.hint") },
    {
      title: t(lang, "admin.overview.cards.servers.title"),
      value: activeServers,
      hint: t(lang, "admin.overview.cards.servers.hint").replace("{count}", String(suspendedServers)),
    },
    {
      title: t(lang, "admin.overview.cards.plans.title"),
      value: `${activePlans}/${plansCount}`,
      hint: t(lang, "admin.overview.cards.plans.hint"),
    },
    {
      title: t(lang, "admin.overview.cards.revenue.title"),
      value: `$${(revenue / 100).toFixed(2)}`,
      hint: t(lang, "admin.overview.cards.revenue.hint"),
    },
  ];

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title} className="p-4">
            <div className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{c.title}</div>
            <div className="mt-1 text-2xl font-extrabold">{c.value}</div>
            <div className="mt-1 text-xs text-[color:var(--muted)]">{c.hint}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="text-sm font-extrabold">{t(lang, "admin.overview.quickActions")}</div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/admin/users" className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface1)] px-3 py-2 font-semibold hover:bg-[color:var(--surface2)]">{t(lang, "admin.overview.links.users")}</Link>
          <Link href="/admin/servers" className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface1)] px-3 py-2 font-semibold hover:bg-[color:var(--surface2)]">{t(lang, "admin.overview.links.servers")}</Link>
          <Link href="/admin/plans" className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface1)] px-3 py-2 font-semibold hover:bg-[color:var(--surface2)]">{t(lang, "admin.overview.links.plans")}</Link>
          <Link href="/admin/billing" className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface1)] px-3 py-2 font-semibold hover:bg-[color:var(--surface2)]">{t(lang, "admin.overview.links.billing")}</Link>
        </div>
        <div className="mt-3 text-xs text-[color:var(--muted)]">
          {t(lang, "admin.overview.totalServers").replace("{count}", String(serversCount))}
        </div>
      </Card>
    </div>
  );
}
