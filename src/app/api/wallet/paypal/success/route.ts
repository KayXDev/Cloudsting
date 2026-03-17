import { env } from "@/server/env";
import { getPayPalAccessToken } from "@/server/payments/paypal";
import { prisma } from "@/server/db";
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

function getPayPalBaseUrl() {
  return env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return redirectResponse(`${env.APP_URL}/wallet/add-funds?funded=0&err=missing_paypal_token`);
  }

  try {
    const walletTransaction = await prisma.walletTransaction.findUnique({ where: { providerRef: token } });
    if (walletTransaction?.status === "COMPLETED") {
      return redirectResponse(`${env.APP_URL}/wallet?funded=1`);
    }

    const accessToken = await getPayPalAccessToken();
    const captureRes = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${token}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!captureRes.ok) {
      return redirectResponse(`${env.APP_URL}/wallet/add-funds?funded=0&err=paypal_capture_failed`);
    }

    await completeWalletTopUpByProviderRef(token);
    return redirectResponse(`${env.APP_URL}/wallet?funded=1`);
  } catch {
    return redirectResponse(`${env.APP_URL}/wallet/add-funds?funded=0&err=wallet_topup_failed`);
  }
}