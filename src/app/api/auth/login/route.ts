import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { rateLimitOrThrow } from "@/server/rateLimit";
import { verifyPassword } from "@/server/auth/password";
import { createSessionForUser } from "@/server/auth/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  try {
    await rateLimitOrThrow({ key: `login:${req.headers.get("x-forwarded-for") ?? "local"}`, limit: 15, windowSeconds: 60 });

    const body = loginSchema.parse(await req.json());
    const email = body.email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return jsonError("Invalid credentials", 401);

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) return jsonError("Invalid credentials", 401);

    await createSessionForUser({ id: user.id, email: user.email, role: user.role });

    return jsonOk({ id: user.id, email: user.email, role: user.role });
  } catch (err: any) {
    const status = err?.status ?? 400;
    return jsonError(err?.message ?? "Bad Request", status);
  }
}
