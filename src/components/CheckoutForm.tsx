"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

export function CheckoutForm(props: { planSlug: string }) {
  const [serverName, setServerName] = useState("My Minecraft Server");
  const [loading, setLoading] = useState<null | "stripe" | "paypal">(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(provider: "stripe" | "paypal") {
    setLoading(provider);
    setError(null);

    try {
      const res = await fetch(`/api/checkout/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ planSlug: props.planSlug, serverName }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message ?? "Checkout failed");
      }

      const url = provider === "stripe" ? json.data.url : json.data.approveUrl;
      if (!url) throw new Error("Missing redirect URL");
      window.location.href = url;
    } catch (e: any) {
      setError(e?.message ?? "Checkout failed");
      setLoading(null);
    }
  }

  return (
    <div className="mt-5">
      <div className="text-xs font-semibold text-[color:var(--muted)]">Server name</div>
      <div className="mt-2">
        <Input value={serverName} onChange={(e) => setServerName(e.target.value)} />
      </div>

      <div className="mt-4 grid gap-2">
        <Button
          onClick={() => startCheckout("stripe")}
          disabled={loading !== null}
          variant="primary"
        >
          {loading === "stripe" ? "Redirecting…" : "Pay with Stripe"}
        </Button>
        <Button
          onClick={() => startCheckout("paypal")}
          disabled={loading !== null}
          variant="secondary"
        >
          {loading === "paypal" ? "Redirecting…" : "Pay with PayPal"}
        </Button>
      </div>

      {error ? (
        <div className="mt-3 text-xs font-semibold text-[color:var(--danger)]">{error}</div>
      ) : null}

      <div className="mt-3 text-xs text-[color:var(--muted)]">
        Checkout requires an account. You’ll return to the dashboard after payment.
      </div>
    </div>
  );
}
