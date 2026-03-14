import { env } from "@/server/env";

function getBaseUrl() {
  return env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalAccessToken() {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal is not configured (PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET). ");
  }

  const res = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(
        `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal token error: ${JSON.stringify(body)}`);
  }

  return body.access_token as string;
}

export async function verifyPayPalWebhook(opts: {
  headers: Headers;
  rawBody: string;
}) {
  if (!env.PAYPAL_WEBHOOK_ID) {
    throw new Error("PAYPAL_WEBHOOK_ID is required to verify webhooks.");
  }

  const token = await getPayPalAccessToken();

  const res = await fetch(`${getBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: opts.headers.get("paypal-auth-algo"),
      cert_url: opts.headers.get("paypal-cert-url"),
      transmission_id: opts.headers.get("paypal-transmission-id"),
      transmission_sig: opts.headers.get("paypal-transmission-sig"),
      transmission_time: opts.headers.get("paypal-transmission-time"),
      webhook_id: env.PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(opts.rawBody),
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal verify error: ${JSON.stringify(body)}`);
  }

  if (body.verification_status !== "SUCCESS") {
    const err = new Error("Invalid PayPal webhook signature");
    (err as any).status = 400;
    throw err;
  }
}
