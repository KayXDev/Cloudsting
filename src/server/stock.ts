import { prisma } from "@/server/db";
import { PterodactylClient } from "@/server/pterodactyl/client";
import type { Node } from "@prisma/client";

export type StockCheck = {
  ok: boolean;
  reason?: string;
};

export async function syncNodesFromPterodactyl() {
  const ptero = new PterodactylClient();
  const res = await ptero.listNodes();

  for (const item of res.data) {
    const a = item.attributes;
    const totalMemoryMb = Number(a.memory) || 0;
    const totalDiskMb = Number(a.disk) || 0;
    const usedMemoryMb = Number(a.allocated_resources?.memory) || 0;
    const usedDiskMb = Number(a.allocated_resources?.disk) || 0;

    await prisma.node.upsert({
      where: { pterodactylNodeId: a.id },
      update: {
        name: a.name,
        totalMemoryMb,
        usedMemoryMb,
        totalDiskMb,
        usedDiskMb,
        maintenanceMode: Boolean(a.maintenance_mode),
      },
      create: {
        pterodactylNodeId: a.id,
        name: a.name,
        totalMemoryMb,
        usedMemoryMb,
        totalDiskMb,
        usedDiskMb,
        maintenanceMode: Boolean(a.maintenance_mode),
      },
    });
  }
}

export async function checkStockForPlanRam(ramMb: number): Promise<StockCheck> {
  // Prefer cached DB nodes if present.
  const nodes = await prisma.node.findMany({});
  if (nodes.length === 0) {
    // Fall back to on-demand sync.
    await syncNodesFromPterodactyl();
  }

  const refreshed = await prisma.node.findMany({});

  const eligible = refreshed.filter((n: Node) => !n.maintenanceMode);
  if (eligible.length === 0) {
    return { ok: false, reason: "No nodes available" };
  }

  const hasCapacity = eligible.some((n: Node) => n.totalMemoryMb - n.usedMemoryMb >= ramMb);
  if (!hasCapacity) {
    return { ok: false, reason: "Out of Stock" };
  }

  return { ok: true };
}
