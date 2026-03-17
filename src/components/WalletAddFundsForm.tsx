"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

const PRESET_AMOUNTS = [5, 10, 25, 50];

export function WalletAddFundsForm() {
  const { lang } = useLanguage();
  const [amountUsd, setAmountUsd] = useState("10");
  const [loading, setLoading] = useState<null | "stripe" | "paypal">(null);
  const [error, setError] = useState<string | null>(null);

  async function startTopUp(provider: "stripe" | "paypal") {
    setLoading(provider);
    setError(null);

    try {
      const amount = Number(amountUsd);
      if (!Number.isFinite(amount) || amount < 5) {
        throw new Error(t(lang, "wallet.addFunds.invalidAmount"));
      }

      const res = await fetch(`/api/wallet/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ amountUsd: amount }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message ?? t(lang, "wallet.addFunds.failed"));
      }

      const url = provider === "paypal" ? json.data.approveUrl : json.data.url;
      if (!url) throw new Error(t(lang, "checkout.missingRedirectUrl"));
      window.location.href = url;
    } catch (err: any) {
      setError(err?.message ?? t(lang, "wallet.addFunds.failed"));
      setLoading(null);
    }
  }

  return (
    <div className="mt-6 grid gap-4">
      <div>
        <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "wallet.addFunds.amount")}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setAmountUsd(String(amount))}
              className={`rounded-xl border px-3 py-2 text-sm font-bold ${amountUsd === String(amount) ? "border-[color:var(--accent)] bg-[color:var(--surface3)] text-[color:var(--text)]" : "border-[color:var(--border)] bg-[color:var(--surface1)] text-[color:var(--muted)] hover:bg-[color:var(--surface2)]"}`}
            >
              ${amount}
            </button>
          ))}
        </div>
        <div className="mt-3 max-w-xs">
          <Input value={amountUsd} onChange={(e) => setAmountUsd(e.target.value)} inputMode="decimal" />
        </div>
        <div className="mt-2 text-xs text-[color:var(--muted)]">{t(lang, "wallet.addFunds.rangeHint")}</div>
      </div>

      <div className="grid gap-2 sm:max-w-sm">
        <Button onClick={() => startTopUp("stripe")} disabled={loading !== null} variant="primary">
          {loading === "stripe" ? t(lang, "checkout.redirecting") : t(lang, "wallet.addFunds.payStripe")}
        </Button>
        <Button onClick={() => startTopUp("paypal")} disabled={loading !== null} variant="secondary">
          {loading === "paypal" ? t(lang, "checkout.redirecting") : t(lang, "wallet.addFunds.payPaypal")}
        </Button>
      </div>

      {error ? <div className="text-xs font-semibold text-[color:var(--danger)]">{error}</div> : null}
    </div>
  );
}