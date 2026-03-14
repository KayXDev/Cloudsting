import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireUser } from "@/server/auth/session";

export async function GET() {
  try {
    const user = await requireUser();

    const servers = await prisma.server.findMany({
      where: { userId: user.id, status: { not: "DELETED" } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        planId: true,
        pterodactylServerId: true,
        pterodactylIdentifier: true,
        nodeId: true,
        allocationId: true,
      },
    });

    const planIds = Array.from(new Set(servers.map((s) => s.planId).filter(Boolean)));
    const plans = planIds.length
      ? await prisma.plan.findMany({
          where: { id: { in: planIds } },
          select: { id: true, slug: true, name: true, ramMb: true },
        })
      : [];
    const planMap = new Map(plans.map((p) => [p.id, p]));

    return jsonOk(
      servers.map((s: any) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        plan: (() => {
          const plan = planMap.get(s.planId);
          return {
            slug: plan?.slug ?? "unknown",
            name: plan?.name ?? "Plan no disponible",
            ramMb: plan?.ramMb ?? 0,
          };
        })(),
        pterodactylServerId: s.pterodactylServerId,
        pterodactylIdentifier: s.pterodactylIdentifier,
        nodeId: s.nodeId,
        allocationId: s.allocationId,
      }))
    );
  } catch (err: any) {
    return jsonError(err?.message ?? "Unauthorized", err?.status ?? 401);
  }
}
