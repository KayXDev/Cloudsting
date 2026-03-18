import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { rateLimitOrThrow } from "@/server/rateLimit";
import { ensureForumSeeded } from "@/server/forum";

const createThreadSchema = z.object({
  categorySlug: z.string().trim().min(2).max(60),
  title: z.string().trim().min(6).max(160),
  body: z.string().trim().min(20).max(8000),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    await rateLimitOrThrow({ key: `forum:create-thread:${user.id}`, limit: 4, windowSeconds: 60 });
    await ensureForumSeeded();

    const body = createThreadSchema.parse(await req.json());
    const category = await prisma.forumCategory.findUnique({
      where: { slug: body.categorySlug },
      select: { id: true, slug: true },
    });

    if (!category) {
      return jsonError("Forum category not found", 404);
    }

    const thread = await prisma.forumThread.create({
      data: {
        categoryId: category.id,
        authorId: user.id,
        title: body.title,
        lastPostAt: new Date(),
        posts: {
          create: {
            authorId: user.id,
            body: body.body,
          },
        },
      },
      select: {
        id: true,
        title: true,
        category: { select: { slug: true } },
      },
    });

    return jsonOk(thread, { status: 201 });
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}