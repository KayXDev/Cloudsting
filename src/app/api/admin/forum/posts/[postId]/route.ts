import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";

const updateSchema = z.object({
  body: z.string().trim().min(6).max(8000),
});

export async function PATCH(req: Request, ctx: { params: { postId: string } }) {
  try {
    await requireAdmin();
    const body = updateSchema.parse(await req.json());

    const post = await prisma.forumPost.update({
      where: { id: ctx.params.postId },
      data: { body: body.body },
      select: { id: true, body: true, updatedAt: true },
    });

    return jsonOk(post);
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}

export async function DELETE(_req: Request, ctx: { params: { postId: string } }) {
  try {
    await requireAdmin();

    const post = await prisma.forumPost.findUnique({
      where: { id: ctx.params.postId },
      select: { id: true, threadId: true },
    });

    if (!post) {
      return jsonError("Forum post not found", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      const orderedPosts = await tx.forumPost.findMany({
        where: { threadId: post.threadId },
        orderBy: { createdAt: "asc" },
        select: { id: true, createdAt: true },
      });

      const firstPost = orderedPosts[0] ?? null;
      if (!firstPost) {
        throw Object.assign(new Error("Forum thread is empty"), { status: 409 });
      }

      if (firstPost.id === post.id) {
        await tx.forumThread.delete({ where: { id: post.threadId } });
        return { deletedThread: true, threadId: post.threadId };
      }

      await tx.forumPost.delete({ where: { id: post.id } });

      const remainingPosts = await tx.forumPost.findMany({
        where: { threadId: post.threadId },
        orderBy: { createdAt: "asc" },
        select: { id: true, createdAt: true },
      });

      const latestPost = remainingPosts[remainingPosts.length - 1] ?? null;
      await tx.forumThread.update({
        where: { id: post.threadId },
        data: {
          replyCount: Math.max(0, remainingPosts.length - 1),
          ...(latestPost ? { lastPostAt: latestPost.createdAt } : {}),
        },
      });

      return { deletedThread: false, threadId: post.threadId };
    });

    return jsonOk(result);
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}