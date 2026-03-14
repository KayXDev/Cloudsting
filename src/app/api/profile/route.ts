import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { hashPassword, verifyPassword } from "@/server/auth/password";

const patchSchema = z
  .object({
    name: z.string().min(1).max(64).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(8).max(128).optional(),
  })
  .refine(
    (v) => v.name != null || v.email != null || v.newPassword != null,
    { message: "No changes provided" }
  )
  .refine(
    (v) => (v.newPassword ? Boolean(v.currentPassword) : true),
    { message: "Current password is required to set a new password" }
  );

export async function PATCH(req: Request) {
  try {
    const sessionUser = await requireUser();
    const body = patchSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    if (!user) return jsonError("User not found", 404);

    if (body.newPassword) {
      const ok = await verifyPassword(body.currentPassword || "", user.passwordHash);
      if (!ok) return jsonError("Current password is incorrect", 400);
    }

    if (body.email && body.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing && existing.id !== user.id) {
        return jsonError("Email is already in use", 409);
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(body.name != null ? { name: body.name } : {}),
        ...(body.email != null ? { email: body.email } : {}),
        ...(body.newPassword ? { passwordHash: await hashPassword(body.newPassword) } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    return jsonOk(updated);
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}
