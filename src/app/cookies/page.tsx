import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { getCookieConsentCopy } from "@/lib/cookieConsent";
import { getLanguageFromCookies } from "@/server/i18n";

export const metadata: Metadata = {
  title: "Cookie Policy | Cloudsting",
  description: "Cookie policy and consent categories used by Cloudsting.",
};

export default function CookiesPage() {
  const lang = getLanguageFromCookies();
  const copy = getCookieConsentCopy(lang);

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface1)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--accent2)]">
          {copy.badge}
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[color:var(--text)]">
          {copy.policyTitle}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          {copy.policyIntro}
        </p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#8ebca4]">
          {copy.policyUpdated}
        </p>

        <div className="mt-10 grid gap-4">
          <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface1)] p-6">
            <h2 className="text-lg font-bold text-[color:var(--text)]">{copy.essentialTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{copy.policyEssential}</p>
          </section>

          <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface1)] p-6">
            <h2 className="text-lg font-bold text-[color:var(--text)]">{copy.preferencesTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{copy.policyPreferences}</p>
          </section>

          <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface1)] p-6">
            <h2 className="text-lg font-bold text-[color:var(--text)]">{copy.analyticsTitle} / {copy.marketingTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{copy.policyOptional}</p>
          </section>
        </div>
      </div>
    </Container>
  );
}