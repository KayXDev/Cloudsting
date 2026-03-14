import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { rateLimitOrThrow } from "@/server/rateLimit";
import { requireUser } from "@/server/auth/session";

const createSchema = z.object({
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(4000),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    await rateLimitOrThrow({ key: `support:create:${user.id}`, limit: 5, windowSeconds: 60 });

    const body = createSchema.parse(await req.json());

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject: body.subject,
        status: "OPEN",
        lastReplyAt: new Date(),
        messages: {
          create: {
            authorId: user.id,
            authorRole: user.role,
            body: body.message,
          },
        },
      },
      select: { id: true, subject: true, status: true, createdAt: true },
    });

    return jsonOk(ticket, { status: 201 });
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}