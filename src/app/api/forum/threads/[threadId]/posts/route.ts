import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { rateLimitOrThrow } from "@/server/rateLimit";
import { forumThreadIsLocked } from "@/server/forum";

const replySchema = z.object({
  body: z.string().trim().min(6).max(8000),
});

export async function POST(req: Request, ctx: { params: { threadId: string } }) {
  try {
    const user = await requireUser();
    await rateLimitOrThrow({ key: `forum:reply:${user.id}`, limit: 10, windowSeconds: 60 });

    const thread = await prisma.forumThread.findUnique({
      where: { id: ctx.params.threadId },
      select: { id: true, status: true },
    });

    if (!thread) {
      return jsonError("Forum thread not found", 404);
    }

    if (forumThreadIsLocked(thread.status)) {
      return jsonError("Thread is locked", 409);
    }

    const body = replySchema.parse(await req.json());
    const now = new Date();

    const post = await prisma.$transaction(async (tx) => {
      const createdPost = await tx.forumPost.create({
        data: {
          threadId: thread.id,
          authorId: user.id,
          body: body.body,
        },
        select: { id: true, createdAt: true },
      });

      await tx.forumThread.update({
        where: { id: thread.id },
        data: {
          lastPostAt: now,
          replyCount: { increment: 1 },
        },
      });

      return createdPost;
    });

    return jsonOk(post, { status: 201 });
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}