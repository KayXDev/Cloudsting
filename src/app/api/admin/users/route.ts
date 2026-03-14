import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true, createdAt: true, pterodactylUserId: true },
    });
    return jsonOk(users);
  } catch (err: any) {
    return jsonError(err?.message ?? "Forbidden", err?.status ?? 403);
  }
}
