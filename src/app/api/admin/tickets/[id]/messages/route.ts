import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { rateLimitOrThrow } from "@/server/rateLimit";
import { requireAdmin } from "@/server/auth/session";

const replySchema = z.object({
  message: z.string().trim().min(2).max(4000),
});

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    await rateLimitOrThrow({ key: `admin:ticket-reply:${admin.id}`, limit: 30, windowSeconds: 60 });

    const body = replySchema.parse(await req.json());
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ctx.params.id } });
    if (!ticket) return jsonError("Ticket not found", 404);

    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: "STAFF_REPLIED",
        closedAt: null,
        lastReplyAt: new Date(),
        messages: {
          create: {
            authorId: admin.id,
            authorRole: admin.role,
            body: body.message,
          },
        },
      },
    });

    return jsonOk({ id: ticket.id });
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}