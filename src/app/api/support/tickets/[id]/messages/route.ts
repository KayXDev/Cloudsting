import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { rateLimitOrThrow } from "@/server/rateLimit";
import { requireUser } from "@/server/auth/session";

const replySchema = z.object({
  message: z.string().trim().min(2).max(4000),
});

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const user = await requireUser();
    await rateLimitOrThrow({ key: `support:reply:${user.id}`, limit: 15, windowSeconds: 60 });

    const body = replySchema.parse(await req.json());
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ctx.params.id } });
    if (!ticket || ticket.userId !== user.id) return jsonError("Ticket not found", 404);
    if (ticket.status === "CLOSED") return jsonError("This ticket is closed", 400);

    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: "CUSTOMER_REPLIED",
        lastReplyAt: new Date(),
        messages: {
          create: {
            authorId: user.id,
            authorRole: user.role,
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