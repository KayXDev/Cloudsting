import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";
import { PterodactylClient } from "@/server/pterodactyl/client";

const bodySchema = z.object({
  action: z.enum(["suspend", "delete"]),
  ids: z.array(z.string().min(1)).min(1).max(200),
});

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = bodySchema.parse(await req.json());

    const servers = await prisma.server.findMany({
      where: { id: { in: body.ids } },
      select: { id: true, pterodactylServerId: true },
    });

    if (servers.length === 0) return jsonError("No servers found", 404);

    const foundIds = new Set(servers.map((s) => s.id));
    const targetIds = body.ids.filter((id) => foundIds.has(id));

    if (body.action === "suspend") {
      try {
        const ptero = new PterodactylClient();
        await Promise.all(
          servers.map(async (s) => {
            if (!s.pterodactylServerId) return;
            try {
              await ptero.suspendServer(s.pterodactylServerId);
            } catch {
              // Continue DB status update even if one panel call fails.
            }
          })
        );
      } catch {
        // If Pterodactyl is not configured, still allow status update in DB.
      }

      await prisma.server.updateMany({
        where: { id: { in: targetIds } },
        data: { status: "SUSPENDED" },
      });

      return jsonOk({ action: body.action, updated: targetIds.length });
    }

    await prisma.server.updateMany({
      where: { id: { in: targetIds } },
      data: { status: "DELETED" },
    });

    return jsonOk({ action: body.action, updated: targetIds.length });
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}
