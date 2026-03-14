import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";
import { syncNodesFromPterodactyl } from "@/server/stock";

export async function GET() {
  try {
    await requireAdmin();
    const nodes = await prisma.node.findMany({ orderBy: { pterodactylNodeId: "asc" } });
    return jsonOk(nodes);
  } catch (err: any) {
    return jsonError(err?.message ?? "Forbidden", err?.status ?? 403);
  }
}

export async function POST() {
  try {
    await requireAdmin();
    await syncNodesFromPterodactyl();
    const nodes = await prisma.node.findMany({ orderBy: { pterodactylNodeId: "asc" } });
    return jsonOk(nodes);
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}
