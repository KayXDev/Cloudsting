import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { CheckoutPageForm } from "@/components/CheckoutPageForm";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export default async function CheckoutPage({ params }: { params: Promise<{ planSlug: string }> }) {
  const lang = getLanguageFromCookies();
  const { planSlug } = await params;

  let user: { id: string; email: string; role: "USER" | "ADMIN" };
  try {
    user = await requireUser();
  } catch {
    redirect(`/login?next=${encodeURIComponent(`/checkout/${planSlug}`)}`);
  }

  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!plan) redirect("/pricing");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14">
      <div className="grid gap-3">
        <h1 className="text-3xl font-extrabold">{t(lang, "checkout.title")}</h1>
        <p className="text-sm text-[color:var(--muted)]">
          {t(lang, "checkout.subtitle")}
        </p>
      </div>

      <div className="mt-8 grid gap-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface1)] p-6 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "checkout.account")}</div>
          <div className="mt-1 font-bold">{user.email}</div>

          <div className="mt-6 text-xs font-semibold text-[color:var(--muted)]">{t(lang, "checkout.next.title")}</div>
          <ul className="mt-2 grid gap-1 text-sm text-[color:var(--muted)]">
            <li>{t(lang, "checkout.next.step1")}</li>
            <li>{t(lang, "checkout.next.step2")}</li>
            <li>{t(lang, "checkout.next.step3")}</li>
          </ul>
        </div>

        <CheckoutPageForm planSlug={plan.slug} planName={plan.name} priceMonthlyCents={plan.priceMonthlyCents} />
      </div>
    </main>
  );
}
