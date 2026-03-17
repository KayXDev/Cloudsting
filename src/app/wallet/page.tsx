import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { createMetadata } from "@/lib/seo";
import { t } from "@/lib/i18n";
import { requireUser } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Wallet",
    description: "Review Cloudsting wallet activity, total payments, invoice counts, and funding actions.",
    path: "/wallet",
    noIndex: true,
  });
}

export default async function WalletPage() {
  const lang = getLanguageFromCookies();
  let user: Awaited<ReturnType<typeof requireUser>>;

  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    select: { id: true, status: true, amountCents: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const paidOrders = orders.filter((order) => order.status === "PAID");
  const totalPaidCents = paidOrders.reduce((sum, order) => sum + order.amountCents, 0);
  const lastPayment = paidOrders[0]?.createdAt ?? null;

  const moneyFmt = new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-US", {
    style: "currency",
    currency: process.env.PAYMENTER_CURRENCY_CODE || "USD",
  });

  return (
    <main>
      <Container className="py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "wallet.title")}</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "wallet.subtitle")}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "wallet.cards.totalPaid")}</div>
              <div className="mt-2 text-3xl font-extrabold text-[color:var(--text)]">{moneyFmt.format(totalPaidCents / 100)}</div>
            </Card>
            <Card className="p-6">
              <div className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "wallet.cards.invoiceCount")}</div>
              <div className="mt-2 text-3xl font-extrabold text-[color:var(--text)]">{paidOrders.length}</div>
            </Card>
            <Card className="p-6">
              <div className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "wallet.cards.lastPayment")}</div>
              <div className="mt-2 text-lg font-extrabold text-[color:var(--text)]">{lastPayment ? new Date(lastPayment).toLocaleString() : "-"}</div>
            </Card>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <div className="text-sm font-extrabold">{t(lang, "wallet.actions.title")}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "wallet.actions.subtitle")}</div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/wallet/add-funds" className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-bold text-black">
                  {t(lang, "nav.addFunds")}
                </Link>
                <Link href="/billing" className="rounded-xl border border-[color:var(--border)] px-4 py-2 text-sm font-bold hover:bg-[color:var(--surface2)]">
                  {t(lang, "nav.invoicesSupport")}
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm font-extrabold">{t(lang, "wallet.note.title")}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "wallet.note.body")}</div>
            </Card>
          </div>
        </div>
      </Container>
    </main>
  );
}