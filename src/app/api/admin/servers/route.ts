import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";

export async function GET() {
  try {
    await requireAdmin();
    const servers = await prisma.server.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        planId: true,
        name: true,
        status: true,
        pterodactylServerId: true,
        nodeId: true,
        allocationId: true,
        createdAt: true,
      },
    });
    const userIds = Array.from(new Set(servers.map((server) => server.userId)));
    const users = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true },
        })
      : [];
    const userEmailById = new Map(users.map((user) => [user.id, user.email]));

    return jsonOk(
      servers.map((s) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        userEmail: userEmailById.get(s.userId) ?? `Deleted user (${s.userId})`,
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
