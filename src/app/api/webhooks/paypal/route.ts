import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { verifyPayPalWebhook } from "@/server/payments/paypal";
import { ensurePaymenterServiceForOrder } from "@/server/billing/paymenter";
import { provisionMinecraftServer } from "@/server/provisioning";
import { completeWalletTopUpByProviderRef } from "@/server/wallet";
import { sendOrderPurchaseNotifications } from "@/server/notifications/purchases";

export async function POST(req: Request) {
  const rawBody = await req.text();

  try {
    await verifyPayPalWebhook({ headers: req.headers, rawBody });

    const event = JSON.parse(rawBody);

    // Prefer capture completed events for fulfillment.
    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const providerRef = event.resource?.supplementary_data?.related_ids?.order_id;
      if (!providerRef) return jsonOk({ ignored: true });

      const walletTransaction = await prisma.walletTransaction.findUnique({ where: { providerRef } });
      if (walletTransaction) {
        await completeWalletTopUpByProviderRef(providerRef);
        return jsonOk({ received: true, walletTopUp: true });
      }

      const order = await prisma.order.findUnique({ where: { providerRef } });
      if (!order) return jsonOk({ ignored: true });

      const meta = (order.metadata ?? {}) as any;
      const planSlug = String(meta.planSlug ?? "");
      const serverName = (meta.serverName ?? "Minecraft Server") as string;
      const vanillaVersion = (meta.vanillaVersion ?? undefined) as string | undefined;

      if (!planSlug) return jsonError("Missing planSlug", 400);

      if (order.status !== "PAID") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID", paidAt: new Date() },
        });

        try {
          await sendOrderPurchaseNotifications(order.id);
        } catch (err) {
          console.error("Purchase notifications failed (paypal webhook)", err);
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
          console.error("Purchase notifications failed (paypal webhook)", err);
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
        console.error("Paymenter sync failed (paypal webhook)", err);
      }
    }

    return jsonOk({ received: true });
  } catch (err: any) {
    return jsonError(err?.message ?? "Webhook error", err?.status ?? 400);
  }
}
