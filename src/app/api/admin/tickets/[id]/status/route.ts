import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";

const bodySchema = z.object({
  status: z.enum(["OPEN", "CLOSED"]),
});

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    await requireAdmin();

    const body = bodySchema.parse(await req.json());
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ctx.params.id } });
    if (!ticket) return jsonError("Ticket not found", 404);

    const updated = await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: body.status,
        closedAt: body.status === "CLOSED" ? new Date() : null,
      },
      select: { id: true, status: true, closedAt: true },
    });

    return jsonOk(updated);
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}