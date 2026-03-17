import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { createMetadata } from "@/lib/seo";
import { t } from "@/lib/i18n";
import { requireUser } from "@/server/auth/session";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Add Funds",
    description: "Add funds and review Cloudsting payment options for your hosting account.",
    path: "/wallet/add-funds",
    noIndex: true,
  });
}

export default async function WalletAddFundsPage() {
  const lang = getLanguageFromCookies();

  try {
    await requireUser();
  } catch {
    redirect("/login");
  }

  return (
    <main>
      <Container className="py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "wallet.addFunds.title")}</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "wallet.addFunds.subtitle")}</p>

          <div className="mt-8 grid gap-4">
            <Card className="p-6">
              <div className="text-sm font-extrabold">{t(lang, "wallet.addFunds.methodsTitle")}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "wallet.addFunds.methodsBody")}</div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/pricing" className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-bold text-black">
                  {t(lang, "wallet.addFunds.ctaPrimary")}
                </Link>
                <Link href="/support" className="rounded-xl border border-[color:var(--border)] px-4 py-2 text-sm font-bold hover:bg-[color:var(--surface2)]">
                  {t(lang, "wallet.addFunds.ctaSupport")}
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </main>
  );
}