import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";
import { PterodactylClient } from "@/server/pterodactyl/client";

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  try {
    await requireAdmin();

    const server = await prisma.server.findUnique({ where: { id: ctx.params.id } });
    if (!server) return jsonError("Not found", 404);
    if (!server.pterodactylServerId) return jsonError("Server not linked to Pterodactyl", 409);

    const ptero = new PterodactylClient();
    await ptero.unsuspendServer(server.pterodactylServerId);

    await prisma.server.update({
      where: { id: server.id },
      data: { status: "ACTIVE" },
    });

    return jsonOk({});
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}
