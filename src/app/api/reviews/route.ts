import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { rateLimitOrThrow } from "@/server/rateLimit";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(4).max(120),
  body: z.string().trim().min(20).max(2000),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    await rateLimitOrThrow({ key: `reviews:create:${user.id}`, limit: 3, windowSeconds: 3600 });
    const body = reviewSchema.parse(await req.json());

    const existing = await prisma.hostingReview.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    const review = existing
      ? await prisma.hostingReview.update({
          where: { id: existing.id },
          data: body,
          select: { id: true, rating: true, title: true, body: true, updatedAt: true },
        })
      : await prisma.hostingReview.create({
          data: {
            userId: user.id,
            ...body,
          },
          select: { id: true, rating: true, title: true, body: true, createdAt: true },
        });

    return jsonOk(review, { status: existing ? 200 : 201 });
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}