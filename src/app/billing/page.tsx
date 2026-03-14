import { redirect } from "next/navigation";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { t } from "@/lib/i18n";
import { requireUser } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { getLanguageFromCookies } from "@/server/i18n";

export default async function BillingPage() {
  const lang = getLanguageFromCookies();
  let user: Awaited<ReturnType<typeof requireUser>>;

  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      planId: true,
      provider: true,
      providerRef: true,
      status: true,
      amountCents: true,
      createdAt: true,
    },
    take: 100,
  });

  const planIds = Array.from(new Set(orders.map((order) => order.planId).filter(Boolean)));
  const plans = planIds.length
    ? await prisma.plan.findMany({
        where: { id: { in: planIds } },
        select: { id: true, name: true, slug: true },
      })
    : [];
  const planMap = new Map(plans.map((plan) => [plan.id, plan]));

  const moneyFmt = new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-US", {
    style: "currency",
    currency: process.env.PAYMENTER_CURRENCY_CODE || "USD",
  });

  return (
    <main>
      <Container className="py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "billing.title")}</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "billing.subtitle")}</p>

          <div className="mt-8 grid gap-4">
            {orders.length === 0 ? (
              <Card className="p-6">
                <div className="text-sm text-[color:var(--muted)]">{t(lang, "billing.empty")}</div>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <div>
                      <div className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "billing.order")}</div>
                      <div className="mt-1 truncate text-sm font-bold text-[color:var(--text)]">{order.providerRef}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "billing.plan")}</div>
                      <div className="mt-1 text-sm font-semibold text-[color:var(--text)]">{planMap.get(order.planId)?.name ?? planMap.get(order.planId)?.slug ?? "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "billing.provider")}</div>
                      <div className="mt-1 text-sm font-semibold text-[color:var(--text)]">{order.provider}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "billing.status")}</div>
                      <div className="mt-1 text-sm font-semibold text-[color:var(--accent)]">{order.status}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "billing.amount")}</div>
                      <div className="mt-1 text-sm font-semibold text-[color:var(--text)]">{moneyFmt.format(order.amountCents / 100)}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "billing.createdAt")}</div>
                      <div className="mt-1 text-sm font-semibold text-[color:var(--text)]">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}