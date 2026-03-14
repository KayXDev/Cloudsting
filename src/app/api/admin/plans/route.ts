import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";

export async function GET() {
  try {
    await requireAdmin();
    const plans = await prisma.plan.findMany({ orderBy: { priceMonthlyCents: "asc" } });
    return jsonOk(plans);
  } catch (err: any) {
    return jsonError(err?.message ?? "Forbidden", err?.status ?? 403);
  }
}
