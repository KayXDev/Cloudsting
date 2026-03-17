"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useLanguage } from "@/components/LanguageProvider";
import {
  TERMS,
  type BillingInterval,
  subtotalCentsForInterval,
  totalCentsForInterval,
} from "@/lib/billingTerms";
import { t } from "@/lib/i18n";

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CheckoutPageForm(props: {
  planSlug: string;
  planName: string;
  priceMonthlyCents: number;
  availableWalletCents: number;
}) {
  const { lang } = useLanguage();
  const [serverName, setServerName] = useState(() => t(lang, "checkout.defaultServerName"));
  const [vanillaVersion, setVanillaVersion] = useState<string>("latest");
  const [versions, setVersions] = useState<null | {
    releases: string[];
    snapshots: string[];
    oldBetas: string[];
    oldAlphas: string[];
  }>(null);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [loading, setLoading] = useState<null | "stripe" | "paypal" | "wallet">(null);
  const [error, setError] = useState<string | null>(null);

  const subtotalCents = useMemo(() => {
    return subtotalCentsForInterval(props.priceMonthlyCents, interval);
  }, [props.priceMonthlyCents, interval]);

  const priceCents = useMemo(() => {
    return totalCentsForInterval(props.priceMonthlyCents, interval);
  }, [props.priceMonthlyCents, interval]);

  const hasEnoughWalletBalance = props.availableWalletCents >= priceCents;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setVersionsError(null);
        const res = await fetch("/api/minecraft/versions", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok)
          throw new Error(json?.error?.message ?? t(lang, "checkout.versionsFailed"));
        if (!cancelled) {
          setVersions({
            releases: json.data.releases ?? [],
            snapshots: json.data.snapshots ?? [],
            oldBetas: json.data.oldBetas ?? [],
            oldAlphas: json.data.oldAlphas ?? [],
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setVersionsError(e?.message ?? t(lang, "checkout.versionsFailed"));
          setVersions({ releases: [], snapshots: [], oldBetas: [], oldAlphas: [] });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  async function startCheckout(provider: "stripe" | "paypal" | "wallet") {
    setLoading(provider);
    setError(null);

    try {
      const res = await fetch(`/api/checkout/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ planSlug: props.planSlug, serverName, interval, vanillaVersion }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message ?? t(lang, "checkout.failed"));
      }

      const url = provider === "paypal" ? json.data.approveUrl : json.data.url;
      if (!url) throw new Error(t(lang, "checkout.missingRedirectUrl"));
      window.location.href = url;
    } catch (e: any) {
      setError(e?.message ?? t(lang, "checkout.failed"));
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-5">
      <div>
        <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "checkout.plan")}</div>
        <div className="mt-1 text-lg font-extrabold">{props.planName}</div>
        <div className="mt-2 text-sm text-[color:var(--muted)]">
          {interval === "month" ? (
            <span>
              {formatUsd(props.priceMonthlyCents)} <span className="text-xs">{t(lang, "suffix.month")}</span>
            </span>
          ) : (
            <span>
              <span className="font-semibold text-[color:var(--text)]">{formatUsd(priceCents)}</span>
              <span className="ml-2 text-xs text-[color:var(--muted)] line-through">{formatUsd(subtotalCents)}</span>
              <span className="ml-2 text-xs">
                {t(lang, "checkout.per").replace(
                  "{interval}",
                  interval === "week"
                    ? t(lang, "billing.week")
                    : interval === "quarter"
                      ? t(lang, "billing.quarter")
                      : t(lang, "billing.year")
                )}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] p-4">
        <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "checkout.walletBalance")}</div>
        <div className="mt-1 text-lg font-extrabold">{formatUsd(props.availableWalletCents)}</div>
        <div className="mt-2 text-xs text-[color:var(--muted)]">
          {hasEnoughWalletBalance
            ? t(lang, "checkout.walletEnough")
            : t(lang, "checkout.walletMissing").replace("{amount}", formatUsd(priceCents - props.availableWalletCents))}
        </div>
        {!hasEnoughWalletBalance ? (
          <Link href="/wallet/add-funds" className="mt-3 inline-flex text-sm font-bold text-[color:var(--accent)]">
            {t(lang, "nav.addFunds")}
          </Link>
        ) : null}
      </div>

      <div>
        <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "checkout.billing")}</div>
        <div className="mt-2 grid gap-2 md:grid-cols-4">
          {TERMS.map((term) => (
            <button
              key={term.interval}
              type="button"
              onClick={() => setInterval(term.interval)}
              className={`rounded-xl border border-[color:var(--border)] px-3 py-2 text-left ${
                interval === term.interval
                  ? "bg-[color:var(--surface3)]"
                  : "bg-[color:var(--surface1)] hover:bg-[color:var(--surface2)]"
              }`}
            >
              <div className="text-sm font-extrabold">{t(lang, `billing.${term.interval}`)}</div>
              <div className="text-xs text-[color:var(--muted)]">
                {term.interval === "week"
                  ? t(lang, "checkout.billing.flexibleStart")
                  : term.interval === "month"
                    ? t(lang, "checkout.billing.payMonthly")
                    : term.interval === "quarter"
                      ? t(lang, "billing.save").replace("{pct}", String(Math.round(term.discountRate * 100)))
                      : t(lang, "checkout.billing.monthsFree").replace("{count}", "2")}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "checkout.serverName")}</div>
        <div className="mt-2">
          <Input value={serverName} onChange={(e) => setServerName(e.target.value)} />
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "checkout.minecraftVersion")}</div>
        <div className="mt-2 grid gap-2">
          <select
            value={vanillaVersion}
            onChange={(e) => setVanillaVersion(e.target.value)}
            className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-2 text-sm text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          >
            <option value="latest">{t(lang, "checkout.version.latest")}</option>
            <option value="snapshot">{t(lang, "checkout.version.snapshot")}</option>
            <option disabled>──────────</option>
            <optgroup label={t(lang, "checkout.version.releases")}>
              {(versions?.releases ?? []).map((v) => (
                <option key={`rel-${v}`} value={v}>
                  {v}
                </option>
              ))}
            </optgroup>
            <optgroup label={t(lang, "checkout.version.oldBetas")}>
              {(versions?.oldBetas ?? []).map((v) => (
                <option key={`beta-${v}`} value={v}>
                  {v}
                </option>
              ))}
            </optgroup>
            <optgroup label={t(lang, "checkout.version.oldAlphas")}>
              {(versions?.oldAlphas ?? []).map((v) => (
                <option key={`alpha-${v}`} value={v}>
                  {v}
                </option>
              ))}
            </optgroup>
          </select>

          {versions === null ? (
            <div className="text-xs text-[color:var(--muted)]">{t(lang, "checkout.loadingVersions")}</div>
          ) : null}
          {versionsError ? (
            <div className="text-xs font-semibold text-[color:var(--danger)]">{versionsError}</div>
          ) : null}
          <div className="text-xs text-[color:var(--muted)]">{t(lang, "checkout.vanillaVersionHint")}</div>
        </div>
      </div>

      <div className="grid gap-2">
        <Button onClick={() => startCheckout("wallet")} disabled={loading !== null || !hasEnoughWalletBalance} variant="primary">
          {loading === "wallet" ? t(lang, "checkout.redirecting") : t(lang, "checkout.payWallet")}
        </Button>
        <Button onClick={() => startCheckout("stripe")} disabled={loading !== null} variant="primary">
          {loading === "stripe" ? t(lang, "checkout.redirecting") : t(lang, "checkout.payStripe")}
        </Button>
        <Button onClick={() => startCheckout("paypal")} disabled={loading !== null} variant="secondary">
          {loading === "paypal" ? t(lang, "checkout.redirecting") : t(lang, "checkout.payPaypal")}
        </Button>
      </div>

      {error ? <div className="text-xs font-semibold text-[color:var(--danger)]">{error}</div> : null}

      <div className="text-xs text-[color:var(--muted)]">{t(lang, "checkout.returnHint")}</div>
    </div>
  );
}
