import { z } from "zod";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { jsonError, jsonOk } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { getPayPalAccessToken } from "@/server/payments/paypal";
import { MAX_WALLET_TOP_UP_CENTS, MIN_WALLET_TOP_UP_CENTS } from "@/server/wallet";

const schema = z.object({
  amountUsd: z.coerce.number().min(MIN_WALLET_TOP_UP_CENTS / 100).max(MAX_WALLET_TOP_UP_CENTS / 100),
});

function getPayPalBaseUrl() {
  return env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());
    const amountCents = Math.round(body.amountUsd * 100);
    const accessToken = await getPayPalAccessToken();
    const appUrl = env.APP_URL.replace(/\/$/, "");

    const orderRes = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: "wallet:topup",
            amount: {
              currency_code: "USD",
              value: (amountCents / 100).toFixed(2),
            },
            custom_id: JSON.stringify({
              paymentKind: "wallet_topup",
              userId: user.id,
              amountCents,
            }),
          },
        ],
        application_context: {
          brand_name: "Cloudsting",
          landing_page: "LOGIN",
          user_action: "PAY_NOW",
          return_url: `${appUrl}/api/wallet/paypal/success`,
          cancel_url: `${appUrl}/wallet/add-funds?canceled=1`,
        },
      }),
    });

    const orderBody = await orderRes.json().catch(() => null);
    if (!orderRes.ok) return jsonError("PayPal create order failed", 400, orderBody);

    await prisma.walletTransaction.create({
      data: {
        userId: user.id,
        provider: "PAYPAL",
        providerRef: orderBody.id,
        kind: "CREDIT",
        status: "PENDING",
        amountCents,
        metadata: {
          paymentKind: "wallet_topup",
          userId: user.id,
          amountCents,
        },
      },
    });

    const approveLink = (orderBody.links ?? []).find((link: any) => link.rel === "approve")?.href;
    return jsonOk({ approveUrl: approveLink });
  } catch (err: any) {
    return jsonError(err?.message ?? "Wallet top-up failed", err?.status ?? 400);
  }
}