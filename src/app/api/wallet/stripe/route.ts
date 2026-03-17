import { z } from "zod";
import { env } from "@/server/env";
import { jsonError, jsonOk } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { getStripe } from "@/server/payments/stripe";
import { MAX_WALLET_TOP_UP_CENTS, MIN_WALLET_TOP_UP_CENTS } from "@/server/wallet";

const schema = z.object({
  amountUsd: z.coerce.number().min(MIN_WALLET_TOP_UP_CENTS / 100).max(MAX_WALLET_TOP_UP_CENTS / 100),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());
    const amountCents = Math.round(body.amountUsd * 100);

    const stripe = getStripe();
    const appUrl = env.APP_URL.replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${appUrl}/api/wallet/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/wallet/add-funds?canceled=1`,
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: { name: `Cloudsting Wallet Top-up (${(amountCents / 100).toFixed(2)} USD)` },
          },
        },
      ],
      metadata: {
        paymentKind: "wallet_topup",
        userId: user.id,
        amountCents: String(amountCents),
      },
    });

    await prisma.walletTransaction.create({
      data: {
        userId: user.id,
        provider: "STRIPE",
        providerRef: session.id,
        kind: "CREDIT",
        status: "PENDING",
        amountCents,
        metadata: session.metadata as any,
      },
    });

    return jsonOk({ url: session.url });
  } catch (err: any) {
    return jsonError(err?.message ?? "Wallet top-up failed", err?.status ?? 400);
  }
}