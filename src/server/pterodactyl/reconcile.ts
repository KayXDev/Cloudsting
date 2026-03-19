import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { PterodactylClient } from "@/server/pterodactyl/client";

type ReconcileScope = {
  userId?: string;
};

export async function reconcileDeletedPterodactylServers(scope: ReconcileScope = {}) {
  if (!env.PTERO_URL || !env.PTERO_APPLICATION_API_KEY) {
    return { deletedIds: [] as string[] };
  }

  const servers = await prisma.server.findMany({
    where: {
      status: { not: "DELETED" },
      pterodactylServerId: { not: null },
      ...(scope.userId ? { userId: scope.userId } : {}),
    },
    select: {
      id: true,
      pterodactylServerId: true,
    },
  });

  if (servers.length === 0) {
    return { deletedIds: [] as string[] };
  }

  const ptero = new PterodactylClient();
  const deletedIds: string[] = [];

  for (const server of servers) {
    if (!server.pterodactylServerId) continue;

    try {
      const remote = await ptero.getServer(server.pterodactylServerId);
      if (!remote) {
        deletedIds.push(server.id);
      }
    } catch (err: any) {
      if (err?.status === 404) {
        deletedIds.push(server.id);
        continue;
      }

      console.error("Pterodactyl reconciliation failed", err);
    }
  }

  if (deletedIds.length > 0) {
    await prisma.server.updateMany({
      where: { id: { in: deletedIds } },
      data: {
        status: "DELETED",
        pterodactylServerId: null,
        pterodactylIdentifier: null,
        nodeId: null,
        allocationId: null,
      },
    });
  }

  return { deletedIds };
}