import { z } from "zod";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { jsonError, jsonOk } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { checkStockForPlanRam } from "@/server/stock";
import { provisionMinecraftServer } from "@/server/provisioning";
import { ensurePaymenterServiceForOrder } from "@/server/billing/paymenter";
import { totalCentsForInterval, type BillingInterval } from "@/lib/billingTerms";
import { createWalletDebitForOrder, refundWalletOrderDebit } from "@/server/wallet";

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

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());

    const plan = await prisma.plan.findUnique({ where: { slug: body.planSlug } });
    if (!plan || !plan.active) return jsonError("Plan not available", 400);

    try {
      const stock = await checkStockForPlanRam(plan.ramMb);
      if (!stock.ok) return jsonError(stock.reason ?? "Out of Stock", 409);
    } catch {
      // Skip when stock dependencies are not configured.
    }

    const interval = body.interval as BillingInterval;
    const amountCents = totalCentsForInterval(plan.priceMonthlyCents, interval);
    const debit = await createWalletDebitForOrder({
      userId: user.id,
      planId: plan.id,
      planSlug: plan.slug,
      amountCents,
      serverName: body.serverName,
      interval: body.interval,
      vanillaVersion: body.vanillaVersion,
    });

    try {
      await provisionMinecraftServer({
        userId: user.id,
        planSlug: plan.slug,
        serverName: body.serverName,
        vanillaVersion: body.vanillaVersion,
        orderId: debit.order.id,
      });

      try {
        await ensurePaymenterServiceForOrder({
          orderId: debit.order.id,
          planSlug: plan.slug,
          userEmail: debit.userEmail,
          priceCents: amountCents,
        });
      } catch (err) {
        console.error("Paymenter sync failed (wallet checkout)", err);
      }

      return jsonOk({ url: `${env.APP_URL}/dashboard?paid=1&wallet=1` });
    } catch (err: any) {
      await prisma.server.updateMany({
        where: { orderId: debit.order.id },
        data: { status: "ERROR" },
      });

      await refundWalletOrderDebit({
        userId: user.id,
        providerRef: debit.providerRef,
        amountCents,
        orderId: debit.order.id,
        reason: err?.message ?? "Provisioning failed after wallet charge",
      });

      return jsonError(err?.message ?? "Provisioning failed", err?.status ?? 400);
    }
  } catch (err: any) {
    return jsonError(err?.message ?? "Wallet checkout failed", err?.status ?? 400);
  }
}