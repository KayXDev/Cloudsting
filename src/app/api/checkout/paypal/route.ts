import { z } from "zod";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { jsonError, jsonOk } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { getPayPalAccessToken } from "@/server/payments/paypal";
import { checkStockForPlanRam } from "@/server/stock";
import { provisionMinecraftServer } from "@/server/provisioning";
import { ensurePaymenterServiceForOrder } from "@/server/billing/paymenter";
import { getLanguageFromRequest } from "@/server/i18n";
import { sendOrderPurchaseNotifications } from "@/server/notifications/purchases";
import { totalCentsForInterval, type BillingInterval } from "@/lib/billingTerms";

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

function getPayPalBaseUrl() {
  return env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

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

    // Free plan (testing): bypass PayPal and provision immediately.
    if (plan.priceMonthlyCents <= 0) {
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          planId: plan.id,
          provider: "PAYPAL",
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
          console.error("Paymenter sync failed (paypal free)", err);
        }

        try {
          await sendOrderPurchaseNotifications(order.id);
        } catch (err) {
          console.error("Purchase notifications failed (paypal free)", err);
        }

        return jsonOk({ id: order.id, approveUrl: await buildDashboardUrl(order.id, { paid: "1", free: "1" }) });
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

    try {
      const stock = await checkStockForPlanRam(plan.ramMb);
      if (!stock.ok) return jsonError(stock.reason ?? "Out of Stock", 409);
    } catch {
      // Skip if not configured
    }

    const token = await getPayPalAccessToken();

    const appUrl = env.APP_URL.replace(/\/$/, "");

    const orderRes = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: `plan:${plan.slug}`,
            amount: {
              currency_code: "USD",
              value: (amountCents / 100).toFixed(2),
            },
            custom_id: JSON.stringify({
              userId: user.id,
              planSlug: plan.slug,
              serverName: body.serverName,
              interval: body.interval,
              language,
              vanillaVersion: body.vanillaVersion,
            }),
          },
        ],
        application_context: {
          brand_name: "Cloudsting",
          landing_page: "LOGIN",
          user_action: "PAY_NOW",
          return_url: `${appUrl}/api/checkout/paypal/success`,
          cancel_url: `${appUrl}/checkout/${plan.slug}?canceled=1`,
        },
      }),
    });
    const orderBody = await orderRes.json();
    if (!orderRes.ok) return jsonError("PayPal create order failed", 400, orderBody);

    await prisma.order.create({
      data: {
        userId: user.id,
        planId: plan.id,
        provider: "PAYPAL",
        providerRef: orderBody.id,
        status: "PENDING",
        amountCents,
        metadata: {
          userId: user.id,
          planSlug: plan.slug,
          serverName: body.serverName,
          interval: body.interval,
          language,
          vanillaVersion: body.vanillaVersion,
        },
      },
    });

    const approveLink = (orderBody.links ?? []).find((l: any) => l.rel === "approve")?.href;
    return jsonOk({ id: orderBody.id, approveUrl: approveLink });
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}
