import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";
import { env } from "@/server/env";
import { sendEmail } from "@/server/email/smtp";
import { renderOrderReceiptEmail } from "@/server/email/templates";
import { prisma } from "@/server/db";
import { DEFAULT_LANG, isLangCode } from "@/lib/i18n";

export async function POST() {
  try {
    const admin = await requireAdmin();
    const adminRecord = await prisma.user.findUnique({
      where: { id: admin.id },
      select: { preferredLanguage: true },
    });
    const lang = isLangCode(adminRecord?.preferredLanguage) ? adminRecord.preferredLanguage : DEFAULT_LANG;
    const preview = renderOrderReceiptEmail({
      brandName: "Cloudsting",
      appUrl: env.APP_URL,
      orderId: `preview-${Date.now()}`,
      customerEmail: admin.email,
      planName: "Vanilla Start",
      serverName: "KX Preview Node",
      provider: "WALLET",
      amountCents: 999,
      paidAt: new Date(),
      lang,
    });

    await sendEmail({
      to: admin.email,
      subject: `${preview.subject} [test]`,
      text: `${preview.text}\n\nCorreo de prueba enviado desde el panel admin.`,
      html: `${preview.html}`,
    });

    return jsonOk({ sentTo: admin.email });
  } catch (err: any) {
    return jsonError(err?.message ?? "Unable to send test receipt", err?.status ?? 400);
  }
}