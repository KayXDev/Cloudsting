import { prisma } from "@/server/db";

export const MIN_WALLET_TOP_UP_CENTS = 500;
export const MAX_WALLET_TOP_UP_CENTS = 50000;

export function formatWalletCurrency(cents: number, locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: process.env.PAYMENTER_CURRENCY_CODE || "USD",
  }).format(cents / 100);
}

export async function completeWalletTopUpByProviderRef(providerRef: string) {
  return prisma.$transaction(async (tx) => {
    const walletTx = await tx.walletTransaction.findUnique({ where: { providerRef } });
    if (!walletTx) return null;
    if (walletTx.status === "COMPLETED") return walletTx;

    await tx.walletTransaction.update({
      where: { id: walletTx.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: walletTx.userId },
      data: {
        walletBalanceCents: { increment: walletTx.amountCents },
      },
    });

    return tx.walletTransaction.findUnique({ where: { id: walletTx.id } });
  });
}

export async function markWalletTopUpFailed(providerRef: string) {
  const walletTx = await prisma.walletTransaction.findUnique({ where: { providerRef } });
  if (!walletTx || walletTx.status !== "PENDING") return walletTx;

  return prisma.walletTransaction.update({
    where: { id: walletTx.id },
    data: { status: "FAILED" },
  });
}

export async function createWalletDebitForOrder(input: {
  userId: string;
  planId: string;
  planSlug: string;
  amountCents: number;
  serverName: string;
  interval: string;
  language: string;
  vanillaVersion?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: {
        id: input.userId,
        walletBalanceCents: { gte: input.amountCents },
      },
      select: {
        id: true,
        email: true,
        walletBalanceCents: true,
      },
    });

    if (!user) {
      throw Object.assign(new Error("Insufficient wallet balance"), { status: 409 });
    }

    const providerRef = `wallet_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    await tx.user.update({
      where: { id: input.userId },
      data: {
        walletBalanceCents: { decrement: input.amountCents },
      },
    });

    const walletTransaction = await tx.walletTransaction.create({
      data: {
        userId: input.userId,
        provider: "WALLET",
        providerRef,
        kind: "DEBIT",
        status: "COMPLETED",
        amountCents: input.amountCents,
        completedAt: new Date(),
        metadata: {
          planId: input.planId,
          planSlug: input.planSlug,
          serverName: input.serverName,
          interval: input.interval,
          language: input.language,
          vanillaVersion: input.vanillaVersion,
        },
      },
    });

    const order = await tx.order.create({
      data: {
        userId: input.userId,
        planId: input.planId,
        provider: "WALLET",
        providerRef,
        status: "PAID",
        amountCents: input.amountCents,
        paidAt: new Date(),
        metadata: {
          userId: input.userId,
          planSlug: input.planSlug,
          serverName: input.serverName,
          interval: input.interval,
          language: input.language,
          vanillaVersion: input.vanillaVersion,
          walletTransactionId: walletTransaction.id,
        },
      },
      select: {
        id: true,
        provider: true,
        amountCents: true,
        paidAt: true,
      },
    });

    return {
      order,
      walletTransactionId: walletTransaction.id,
      providerRef,
      userEmail: user.email,
      remainingBalanceCents: user.walletBalanceCents - input.amountCents,
    };
  });
}

export async function refundWalletOrderDebit(input: {
  userId: string;
  providerRef: string;
  amountCents: number;
  orderId: string;
  reason: string;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: input.userId },
      data: {
        walletBalanceCents: { increment: input.amountCents },
      },
    });

    await tx.walletTransaction.create({
      data: {
        userId: input.userId,
        provider: "WALLET",
        providerRef: `${input.providerRef}_refund`,
        kind: "CREDIT",
        status: "COMPLETED",
        amountCents: input.amountCents,
        completedAt: new Date(),
        metadata: {
          refundOf: input.providerRef,
          reason: input.reason,
        },
      },
    });

    await tx.order.update({
      where: { id: input.orderId },
      data: {
        status: "REFUNDED",
        metadata: {
          refundedWalletDebit: input.providerRef,
          refundReason: input.reason,
        },
      },
    });
  });
}