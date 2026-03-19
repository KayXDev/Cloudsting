import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { sendEmail } from "@/server/email/smtp";
import { renderOrderReceiptEmail } from "@/server/email/templates";
import { DEFAULT_LANG, isLangCode } from "@/lib/i18n";
import { resolveLanguagePreference } from "@/server/i18n";

export async function sendOrderReceiptEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true, preferredLanguage: true } },
      plan: { select: { name: true, slug: true } },
    },
  });

  if (!order || order.status !== "PAID" || !order.paidAt || order.receiptEmailSentAt) {
    return false;
  }

  const claimed = await prisma.order.updateMany({
    where: {
      id: order.id,
      status: "PAID",
      OR: [
        { receiptEmailSentAt: null },
        { receiptEmailSentAt: { isSet: false } },
      ],
    },
    data: {
      receiptEmailSentAt: new Date(),
    },
  });

  if (claimed.count === 0) {
    return false;
  }

  const meta = (order.metadata ?? {}) as Record<string, unknown>;
  const lang = resolveLanguagePreference(
    typeof meta.language === "string" && isLangCode(meta.language) ? meta.language : null,
    order.user.preferredLanguage,
    DEFAULT_LANG,
  );
  const serverName = typeof meta.serverName === "string" && meta.serverName.trim().length > 0
    ? meta.serverName
    : "Minecraft Server";

  try {
    const receipt = renderOrderReceiptEmail({
      brandName: "Cloudsting",
      appUrl: env.APP_URL,
      orderId: order.id,
      customerEmail: order.user.email,
      planName: order.plan?.name ?? String(meta.planSlug ?? "Hosting Plan"),
      serverName,
      provider: order.provider,
      amountCents: order.amountCents,
      paidAt: order.paidAt,
      lang,
    });

    await sendEmail({
      to: order.user.email,
      subject: receipt.subject,
      text: receipt.text,
      html: receipt.html,
    });

    return true;
  } catch (err) {
    await prisma.order.update({
      where: { id: order.id },
      data: { receiptEmailSentAt: null },
    }).catch(() => null);

    throw err;
  }
}