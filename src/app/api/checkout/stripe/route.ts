import { z } from "zod";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { jsonError, jsonOk } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { getStripe } from "@/server/payments/stripe";
import { checkStockForPlanRam } from "@/server/stock";
import { provisionMinecraftServer } from "@/server/provisioning";
import { ensurePaymenterServiceForOrder } from "@/server/billing/paymenter";
import { getLanguageFromRequest } from "@/server/i18n";
import { sendOrderPurchaseNotifications } from "@/server/notifications/purchases";
import { stripeRecurringForInterval, totalCentsForInterval, type BillingInterval } from "@/lib/billingTerms";

const schema = z.object({
  planSlug: z.string().min(1),
  serverName: z.string().min(3).max(48),
  interval: z.enum(["week", "month", "quarter", "year"]).default("month"),
  vanillaVersion: z
    .string()
    .min(3)
    .max(15)
    .regex(/^(latest|snapshot|\d+\.\d+(?:\.\d+)?)$/)
    .default("latest"),
});

async function buildDashboardUrl(orderId: string, params: Record<string, string>) {
  const server = await prisma.server.findUnique({ where: { orderId }, select: { id: true } });
  const search = new URLSearchParams(params);
  if (server) search.set("server", server.id);
  const base = `${env.APP_URL}/dashboard?${search.toString()}`;
  return server ? `${base}#server-${server.id}` : base;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());
    const language = getLanguageFromRequest(req);

    const plan = await prisma.plan.findUnique({ where: { slug: body.planSlug } });
    if (!plan || !plan.active) return jsonError("Plan not available", 400);

    const interval = body.interval as BillingInterval;
    const amountCents = totalCentsForInterval(plan.priceMonthlyCents, interval);
    const recurring = stripeRecurringForInterval(interval);

    // Free plan (testing): bypass Stripe and provision immediately.
    if (plan.priceMonthlyCents <= 0) {
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          planId: plan.id,
          provider: "STRIPE",
          providerRef: `free_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          status: "PENDING",
          amountCents: 0,
          metadata: {
            userId: user.id,
            planSlug: plan.slug,
            serverName: body.serverName,
            interval: body.interval,
            language,
            vanillaVersion: body.vanillaVersion,
          },
        },
        select: { id: true },
      });

      try {
        await provisionMinecraftServer({
          userId: user.id,
          planSlug: plan.slug,
          serverName: body.serverName,
          vanillaVersion: body.vanillaVersion,
          orderId: order.id,
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID", paidAt: new Date() },
        });

        try {
          await ensurePaymenterServiceForOrder({
            orderId: order.id,
            planSlug: plan.slug,
            userEmail: user.email,
            priceCents: 0,
          });
        } catch (err) {
          console.error("Paymenter sync failed (stripe free)", err);
        }

        try {
          await sendOrderPurchaseNotifications(order.id);
        } catch (err) {
          console.error("Purchase notifications failed (stripe free)", err);
        }

        return jsonOk({ url: await buildDashboardUrl(order.id, { paid: "1", free: "1" }) });
      } catch (err: any) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "FAILED" },
        });
        await prisma.server.updateMany({
          where: { orderId: order.id },
          data: { status: "ERROR" },
        });
        return jsonError(err?.message ?? "Provisioning failed", err?.status ?? 400);
      }
    }

    // Stock check (requires Pterodactyl sync configured)
    try {
      const stock = await checkStockForPlanRam(plan.ramMb);
      if (!stock.ok) return jsonError(stock.reason ?? "Out of Stock", 409);
    } catch {
      // If Pterodactyl/Redis isn't configured yet, skip stock check.
    }

    const stripe = getStripe();

    const appUrl = env.APP_URL.replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: `${appUrl}/api/checkout/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/${plan.slug}?canceled=1`,
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            recurring,
            product_data: { name: `Cloudsting — ${plan.name}` },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        planSlug: plan.slug,
        serverName: body.serverName,
        interval: body.interval,
        language,
        vanillaVersion: body.vanillaVersion,
      },
    });

    await prisma.order.create({
      data: {
        userId: user.id,
        planId: plan.id,
        provider: "STRIPE",
        providerRef: session.id,
        status: "PENDING",
        amountCents,
        metadata: session.metadata as any,
      },
    });

    return jsonOk({ url: session.url });
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}
