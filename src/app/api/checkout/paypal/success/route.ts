import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { jsonError } from "@/server/http";
import { ensurePaymenterServiceForOrder } from "@/server/billing/paymenter";
import { getPayPalAccessToken } from "@/server/payments/paypal";
import { provisionMinecraftServer } from "@/server/provisioning";

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
  // PayPal sends users back with ?token=ORDER_ID (and PayerID)
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return redirectResponse(`${env.APP_URL}/dashboard?paid=0&err=missing_paypal_token`);
  }

  try {
    const order = await prisma.order.findUnique({
      where: { providerRef: token },
      include: { user: true, plan: true },
    });
    if (!order) {
      return redirectResponse(`${env.APP_URL}/dashboard?paid=0&err=order_not_found`);
    }

    const meta = (order.metadata ?? {}) as any;
    const planSlug = String(order.plan?.slug ?? meta.planSlug ?? "");
    const serverName = String(meta.serverName ?? "Minecraft Server");
    const vanillaVersion = (meta.vanillaVersion ?? undefined) as string | undefined;

    if (!planSlug) {
      return redirectResponse(`${env.APP_URL}/dashboard?paid=0&err=missing_plan`);
    }

    if (order.status !== "PAID") {
      const accessToken = await getPayPalAccessToken();
      const captureRes = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${token}/capture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const captureBody = await captureRes.json().catch(() => ({}));
      if (!captureRes.ok) {
        return jsonError("PayPal capture failed", 400, captureBody);
      }

      // Mark paid + provision.
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: new Date() },
      });

      await provisionMinecraftServer({
        userId: order.userId,
        planSlug,
        serverName,
        vanillaVersion,
        orderId: order.id,
      });
    }

    // Best-effort Paymenter sync (retryable if the user revisits the success URL).
    try {
      const server = await prisma.server.findUnique({ where: { orderId: order.id } });
      if (server) {
        await ensurePaymenterServiceForOrder({
          orderId: order.id,
          planSlug,
          userEmail: order.user.email,
          priceCents: order.amountCents,
        });
      }
    } catch (err) {
      console.error("Paymenter sync failed (paypal success)", err);
    }

    return redirectResponse(`${env.APP_URL}/dashboard?paid=1`);
  } catch {
    return redirectResponse(`${env.APP_URL}/dashboard?paid=0&err=provision_failed`);
  }
}
