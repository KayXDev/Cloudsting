"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useLanguage } from "@/components/LanguageProvider";
import { TERMS, totalCentsForInterval, type BillingInterval } from "@/lib/billingTerms";
import { clearCart, readCart, removeCartItem, updateCartItem, type CartItem } from "@/lib/cart";
import { t } from "@/lib/i18n";

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CartPageClient() {
  const { lang } = useLanguage();
  const [items, setItems] = useState<CartItem[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    function sync() {
      setItems(readCart());
    }
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("cloudsting-cart-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cloudsting-cart-change", sync);
    };
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + totalCentsForInterval(item.priceMonthlyCents, item.interval), 0), [items]);

  function save(id: string, patch: Partial<CartItem>) {
    updateCartItem(id, patch);
    setStatus(t(lang, "cart.saved"));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr),320px]">
      <div className="grid gap-4">
        {items.length === 0 ? (
          <Card className="p-6 text-sm text-[color:var(--muted)]">{t(lang, "cart.empty")}</Card>
        ) : items.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-xl font-extrabold text-[color:var(--text)]">{item.planName}</div>
                <div className="mt-2 text-sm text-[color:var(--muted)]">{Math.round(item.ramMb / 1024)} GB RAM • {item.cpuPercent}% CPU • {Math.round(item.diskMb / 1024)} GB SSD</div>
              </div>
              <div className="text-lg font-extrabold text-[color:var(--text)]">{formatUsd(totalCentsForInterval(item.priceMonthlyCents, item.interval))}</div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t(lang, "cart.serverName")}</div>
                <input
                  className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-2 text-sm text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                  value={item.serverName}
                  onChange={(e) => save(item.id, { serverName: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t(lang, "cart.interval")}</div>
                <select
                  className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-2 text-sm text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                  value={item.interval}
                  onChange={(e) => save(item.id, { interval: e.target.value as BillingInterval })}
                >
                  {TERMS.map((term) => <option key={term.interval} value={term.interval}>{t(lang, `billing.${term.interval}`)}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/checkout/${item.planSlug}?cartItem=${item.id}`} className="inline-flex items-center justify-center rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-bold text-black">
                {t(lang, "cart.checkout")}
              </Link>
              <Button type="button" variant="secondary" onClick={() => removeCartItem(item.id)}>{t(lang, "cart.remove")}</Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="text-sm font-extrabold text-[color:var(--text)]">{t(lang, "cart.summary")}</div>
        <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "cart.items").replace("{count}", String(items.length))}</div>
        <div className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t(lang, "cart.total")}</div>
        <div className="mt-2 text-3xl font-extrabold text-[color:var(--text)]">{formatUsd(total)}</div>
        <Button type="button" variant="secondary" className="mt-6 w-full" onClick={() => clearCart()}>{t(lang, "cart.clear")}</Button>
        {status ? <div className="mt-3 text-xs font-semibold text-[color:var(--accent)]">{status}</div> : null}
      </Card>
    </div>
  );
}