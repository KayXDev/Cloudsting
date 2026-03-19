import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { sendDiscordPurchaseTestWebhook } from "@/server/notifications/purchases";

export async function POST() {
  try {
    const admin = await requireAdmin();
    const adminRecord = await prisma.user.findUnique({
      where: { id: admin.id },
      select: { name: true, preferredLanguage: true },
    });

    await sendDiscordPurchaseTestWebhook({
      email: admin.email,
      name: adminRecord?.name ?? null,
      lang: adminRecord?.preferredLanguage,
    });

    return jsonOk({ sent: true });
  } catch (err: any) {
    return jsonError(err?.message ?? "Unable to send Discord test webhook", err?.status ?? 400);
  }
}