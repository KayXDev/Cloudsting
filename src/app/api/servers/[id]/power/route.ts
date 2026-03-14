import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { PterodactylClient } from "@/server/pterodactyl/client";

const schema = z.object({
  action: z.enum(["start", "stop", "restart", "kill"]),
});

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());

    const server = await prisma.server.findFirst({ where: { id: ctx.params.id, userId: user.id } });
    if (!server) return jsonError("Not found", 404);
    if (!server.pterodactylIdentifier) return jsonError("Server not linked to Pterodactyl yet", 409);

    const ptero = new PterodactylClient();
    await ptero.power(server.pterodactylIdentifier, body.action);

    return jsonOk({});
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}
