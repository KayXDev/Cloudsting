import { jsonError, jsonOk } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { prisma } from "@/server/db";

export async function GET() {
  try {
    const sessionUser = await requireUser();
    const dbUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { name: true, walletBalanceCents: true },
    });

    return jsonOk({
      ...sessionUser,
      name: dbUser?.name ?? null,
      walletBalanceCents: dbUser?.walletBalanceCents ?? 0,
    });
  } catch (err: any) {
    return jsonError(err?.message ?? "Unauthorized", err?.status ?? 401);
  }
}
