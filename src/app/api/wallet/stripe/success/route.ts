import Stripe from "stripe";
import { env } from "@/server/env";
import { completeWalletTopUpByProviderRef } from "@/server/wallet";

function redirectResponse(url: string) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");

  if (!env.STRIPE_SECRET_KEY) {
    return redirectResponse(`${env.APP_URL}/wallet/add-funds?funded=0&err=stripe_not_configured`);
  }

  if (!sessionId) {
    return redirectResponse(`${env.APP_URL}/wallet/add-funds?funded=0&err=missing_session`);
  }

  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return redirectResponse(`${env.APP_URL}/wallet/add-funds?funded=0&err=not_paid`);
    }

    await completeWalletTopUpByProviderRef(session.id);
    return redirectResponse(`${env.APP_URL}/wallet?funded=1`);
  } catch {
    return redirectResponse(`${env.APP_URL}/wallet/add-funds?funded=0&err=wallet_topup_failed`);
  }
}