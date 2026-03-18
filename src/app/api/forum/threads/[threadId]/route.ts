import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";

const updateThreadSchema = z.object({
  pinned: z.boolean().optional(),
  locked: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: { threadId: string } }) {
  try {
    await requireAdmin();
    const body = updateThreadSchema.parse(await req.json());

    const thread = await prisma.forumThread.update({
      where: { id: ctx.params.threadId },
      data: {
        ...(typeof body.pinned === "boolean" ? { pinned: body.pinned } : {}),
        ...(typeof body.locked === "boolean" ? { status: body.locked ? "LOCKED" : "OPEN" } : {}),
      },
      select: { id: true, pinned: true, status: true },
    });

    return jsonOk(thread);
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}