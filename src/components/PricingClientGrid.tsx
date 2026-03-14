"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TERMS, type BillingInterval, totalCentsForInterval } from "@/lib/billingTerms";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export type PricingPlan = {
  slug: string;
  name: string;
  ramMb: number;
  cpuPercent: number;
  diskMb: number;
  priceMonthlyCents: number;
  features: readonly string[];
};

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function intervalSuffix(interval: BillingInterval) {
  if (interval === "week") return "suffix.week";
  if (interval === "month") return "suffix.month";
  if (interval === "quarter") return "suffix.quarter";
  return "suffix.year";
}

export function PricingClientGrid(props: { plans: PricingPlan[]; canCheckout: boolean }) {
  const { lang } = useLanguage();
  const [interval, setInterval] = useState<BillingInterval>("month");
  const featuredSlug = props.plans[Math.min(2, props.plans.length - 1)]?.slug ?? props.plans[0]?.slug;

  const terms = useMemo(() => TERMS, []);

  return (
    <div className="mt-10">
      <div className="kx-fade-up mx-auto mb-8 flex w-fit max-w-[620px] flex-wrap items-center justify-center gap-1 rounded-full border border-[#242424] bg-[#0f0f0f] p-1">
        {terms.map((term) => (
          <button
            key={term.interval}
            type="button"
            onClick={() => setInterval(term.interval)}
            className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.04em] transition ${
              interval === term.interval
                ? "bg-[#1AD76F] text-black"
                : "bg-transparent text-gray-400 hover:text-white"
            }`}
          >
            {t(lang, `billing.${term.interval}`)}
            {term.discountRate > 0 ? (
              <span className="ml-1 text-[7px]">{t(lang, "billing.save").replace("{pct}", String(Math.round(term.discountRate * 100)))}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mx-auto flex max-w-[1160px] flex-wrap items-stretch justify-center gap-4">
        {props.plans.map((p, index) => {
          const currentPrice = totalCentsForInterval(p.priceMonthlyCents, interval);
          const isFeatured = p.slug === featuredSlug;
          const icon = ["🦇", "🕷️", "🟩", "💀"][index % 4];
          const onlineLabel = p.priceMonthlyCents <= 0 ? t(lang, "pricing.foreverFree") : t(lang, "pricing.online247");

          return (
            <div
              key={`${p.slug}-${index}`}
              className={`relative w-full max-w-[260px] rounded-2xl border p-5 backdrop-blur-md transition ${
                isFeatured
                  ? "kx-fade-up-delay-1 border-[#1AD76F] bg-[linear-gradient(180deg,rgba(26,215,111,0.14),rgba(14,14,14,0.92))] shadow-[0_12px_32px_rgba(26,215,111,0.2)]"
                  : "kx-fade-up-delay-2 border-[#2a2a2a] bg-[#121212]"
              }`}
            >
              {isFeatured ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1AD76F] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-black">
                  {t(lang, "pricing.mostPopular")}
                </div>
              ) : null}

              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#2b2b2b] bg-[#1a1a1a] text-xl">
                {icon}
              </div>

              <div className="text-2xl font-extrabold text-white">{p.name}</div>
              <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1AD76F]" />
                {onlineLabel}
              </div>

              <div className="mt-4 text-4xl font-extrabold text-white">{formatUsd(currentPrice)}</div>
              <div className="text-sm text-gray-500">{t(lang, intervalSuffix(interval))}</div>

              <div className="my-4 h-px bg-[#272727]" />

              <ul className="mt-5 grid gap-2.5 text-sm text-gray-300">
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#1AD76F]" />{t(lang, "pricing.spec.ram").replace("{gb}", String(Math.round(p.ramMb / 1024)))}</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#1AD76F]" />{t(lang, "pricing.spec.disk").replace("{gb}", String(Math.round(p.diskMb / 1024)))}</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#1AD76F]" />{t(lang, "pricing.spec.cpu").replace("{pct}", String(p.cpuPercent))}</li>
                {p.features.slice(0, 2).map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#1AD76F]" />{f}</li>
                ))}
              </ul>

              {props.canCheckout ? (
                <Link
                  href={`/checkout/${p.slug}`}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-extrabold transition ${
                    isFeatured
                      ? "bg-[#1AD76F] text-black hover:bg-[#18c263]"
                      : "bg-[#1b1b1b] text-white hover:bg-[#262626]"
                  }`}
                >
                  {p.priceMonthlyCents <= 0 ? t(lang, "pricing.startFree") : t(lang, "pricing.selectPlan").replace("{name}", p.name)}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#1b1b1b] px-4 py-3 text-sm font-bold text-white hover:bg-[#262626]"
                >
                  {t(lang, "pricing.loginToOrder")}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
