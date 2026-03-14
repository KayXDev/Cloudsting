import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";

export async function GET() {
  try {
    await requireAdmin();
    const servers = await prisma.server.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    });

    return jsonOk(
      servers.map((s: any) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        userEmail: s.user.email,
        planId: s.planId,
        pterodactylServerId: s.pterodactylServerId,
        nodeId: s.nodeId,
        allocationId: s.allocationId,
        createdAt: s.createdAt,
      }))
    );
  } catch (err: any) {
    return jsonError(err?.message ?? "Forbidden", err?.status ?? 403);
  }
}
