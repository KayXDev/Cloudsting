import Stripe from "stripe";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { ensurePaymenterServiceForOrder } from "@/server/billing/paymenter";
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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");

  if (!env.STRIPE_SECRET_KEY) {
    return redirectResponse(`${env.APP_URL}/dashboard?paid=0&err=stripe_not_configured`);
  }

  if (!sessionId) {
    return redirectResponse(`${env.APP_URL}/dashboard?paid=0&err=missing_session`);
  }

  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // For subscription checkouts, Stripe marks payment_status = 'paid' when successful.
    if (session.payment_status !== "paid") {
      return redirectResponse(`${env.APP_URL}/dashboard?paid=0&err=not_paid`);
    }

    const providerRef = session.id;
    const order = await prisma.order.findUnique({
      where: { providerRef },
      include: { user: true, plan: true },
    });
    if (!order) {
      return redirectResponse(`${env.APP_URL}/dashboard?paid=1&err=order_not_found`);
    }

    const meta = (order.metadata ?? {}) as any;
    const planSlug = String(order.plan?.slug ?? session.metadata?.planSlug ?? meta.planSlug ?? "");

    if (!planSlug) {
      return redirectResponse(`${env.APP_URL}/dashboard?paid=0&err=missing_plan`);
    }

    if (order.status !== "PAID") {
      const serverName = String(session.metadata?.serverName ?? meta.serverName ?? "Minecraft Server");
      const vanillaVersion = (session.metadata?.vanillaVersion ?? meta.vanillaVersion ?? undefined) as
        | string
        | undefined;

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
      console.error("Paymenter sync failed (stripe success)", err);
    }

    return redirectResponse(`${env.APP_URL}/dashboard?paid=1`);
  } catch {
    // Keep response generic; Stripe will have logs for details.
    return redirectResponse(`${env.APP_URL}/dashboard?paid=0&err=provision_failed`);
  }
}
