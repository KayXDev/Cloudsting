import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";

const bodySchema = z
  .object({
    priceMonthlyCents: z.coerce.number().int().min(0).max(10_000_00).optional(),
    ramMb: z.coerce.number().int().positive().max(262_144).optional(),
    cpuPercent: z.coerce.number().int().positive().max(10_000).optional(),
    diskMb: z.coerce.number().int().positive().max(2_000_000).optional(),
    databasesLimit: z.coerce.number().int().min(0).max(100).optional(),
    backupsLimit: z.coerce.number().int().min(0).max(100).optional(),
    allocationsLimit: z.coerce.number().int().min(1).max(100).optional(),
    active: z.coerce.boolean().optional(),
  })
  .refine(
    (v) =>
      v.priceMonthlyCents != null ||
      v.ramMb != null ||
      v.cpuPercent != null ||
      v.diskMb != null ||
      v.databasesLimit != null ||
      v.backupsLimit != null ||
      v.allocationsLimit != null ||
      v.active != null,
    { message: "No fields provided" }
  );

export async function PATCH(req: Request, ctx: { params: { slug: string } }) {
  try {
    await requireAdmin();

    const slug = ctx.params.slug;
    if (!slug) return jsonError("Missing slug", 400);

    const body = bodySchema.parse(await req.json());

    const plan = await prisma.plan.update({
      where: { slug },
      data: {
        ...(body.priceMonthlyCents != null ? { priceMonthlyCents: body.priceMonthlyCents } : {}),
        ...(body.ramMb != null ? { ramMb: body.ramMb } : {}),
        ...(body.cpuPercent != null ? { cpuPercent: body.cpuPercent } : {}),
        ...(body.diskMb != null ? { diskMb: body.diskMb } : {}),
        ...(body.databasesLimit != null ? { databasesLimit: body.databasesLimit } : {}),
        ...(body.backupsLimit != null ? { backupsLimit: body.backupsLimit } : {}),
        ...(body.allocationsLimit != null ? { allocationsLimit: body.allocationsLimit } : {}),
        ...(body.active != null ? { active: body.active } : {}),
      },
      select: {
        slug: true,
        name: true,
        priceMonthlyCents: true,
        ramMb: true,
        cpuPercent: true,
        diskMb: true,
        databasesLimit: true,
        backupsLimit: true,
        allocationsLimit: true,
        active: true,
        updatedAt: true,
      },
    });

    return jsonOk(plan);
  } catch (err: any) {
    const msg = err?.message ?? "Bad Request";
    const status = err?.status ?? 400;

    if (msg.includes("Record to update not found")) {
      return jsonError("Plan not found", 404);
    }

    return jsonError(msg, status);
  }
}
