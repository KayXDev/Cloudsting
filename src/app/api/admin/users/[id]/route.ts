import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";

const bodySchema = z
  .object({
    role: z.enum(["USER", "ADMIN"]).optional(),
  })
  .refine((v) => v.role, { message: "Missing role" });

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    await requireAdmin();

    const id = ctx.params.id;
    if (!id) return jsonError("Missing id", 400);

    const body = bodySchema.parse(await req.json());

    const user = await prisma.user.update({
      where: { id },
      data: { role: body.role },
      select: { id: true, email: true, role: true, updatedAt: true },
    });

    return jsonOk(user);
  } catch (err: any) {
    const msg = err?.message ?? "Bad Request";
    const status = err?.status ?? 400;

    if (msg.includes("Record to update not found")) {
      return jsonError("User not found", 404);
    }

    return jsonError(msg, status);
  }
}
