import Stripe from "stripe";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { jsonError, jsonOk } from "@/server/http";
import { ensurePaymenterServiceForOrder } from "@/server/billing/paymenter";
import { provisionMinecraftServer } from "@/server/provisioning";
import { completeWalletTopUpByProviderRef } from "@/server/wallet";
import { sendOrderPurchaseNotifications } from "@/server/notifications/purchases";

export async function POST(req: Request) {
  try {
    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
      return jsonError("Stripe webhooks not configured", 500);
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });

    const sig = req.headers.get("stripe-signature");
    if (!sig) return jsonError("Missing stripe-signature", 400);

    const rawBody = await req.text();

    const event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const providerRef = session.id;
      const walletTransaction = await prisma.walletTransaction.findUnique({ where: { providerRef } });
      if (walletTransaction) {
        await completeWalletTopUpByProviderRef(providerRef);
        return jsonOk({ received: true, walletTopUp: true });
      }

      const order = await prisma.order.findUnique({ where: { providerRef } });
      if (!order) return jsonOk({ ignored: true });

      const orderMeta = (order.metadata ?? {}) as any;
      const planSlug = String(session.metadata?.planSlug ?? orderMeta.planSlug ?? "");
      const serverName = (session.metadata?.serverName ?? orderMeta.serverName ?? "Minecraft Server") as string;
      const vanillaVersion = (session.metadata?.vanillaVersion ?? orderMeta.vanillaVersion ?? undefined) as
        | string
        | undefined;

      if (!planSlug) return jsonError("Missing planSlug", 400);

      if (order.status !== "PAID") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID", paidAt: new Date() },
        });

        try {
          await sendOrderPurchaseNotifications(order.id);
        } catch (err) {
          console.error("Purchase notifications failed (stripe webhook)", err);
        }

        await provisionMinecraftServer({
          userId: order.userId,
          planSlug,
          serverName,
          vanillaVersion,
          orderId: order.id,
        });

      }
      if (order.status === "PAID") {
        try {
          await sendOrderPurchaseNotifications(order.id);
        } catch (err) {
          console.error("Purchase notifications failed (stripe webhook)", err);
        }
      }

      // Best-effort Paymenter sync (retryable if the webhook is retried).
      try {
        const server = await prisma.server.findUnique({ where: { orderId: order.id } });
        if (server) {
          const user = await prisma.user.findUnique({ where: { id: order.userId } });
          if (user) {
            await ensurePaymenterServiceForOrder({
              orderId: order.id,
              planSlug,
              userEmail: user.email,
              priceCents: order.amountCents,
            });
          }
        }
      } catch (err) {
        console.error("Paymenter sync failed (stripe webhook)", err);
      }
    }

    return jsonOk({ received: true });
  } catch (err: any) {
    return jsonError(err?.message ?? "Webhook error", err?.status ?? 400);
  }
}
