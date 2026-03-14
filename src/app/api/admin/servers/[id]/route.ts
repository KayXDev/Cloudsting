import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  try {
    await requireAdmin();

    const server = await prisma.server.findUnique({ where: { id: ctx.params.id } });
    if (!server) return jsonError("Server not found", 404);

    await prisma.server.update({
      where: { id: server.id },
      data: { status: "DELETED" },
    });

    return jsonOk({ id: server.id, status: "DELETED" });
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}
