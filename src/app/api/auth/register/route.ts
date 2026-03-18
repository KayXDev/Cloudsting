import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { rateLimitOrThrow } from "@/server/rateLimit";
import { hashPassword } from "@/server/auth/password";
import { createSessionForUser } from "@/server/auth/session";
import { provisionPanelAccessForUser } from "@/server/auth/onboarding";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(80).optional(),
});

export async function POST(req: Request) {
  try {
    await rateLimitOrThrow({ key: `register:${req.headers.get("x-forwarded-for") ?? "local"}`, limit: 10, windowSeconds: 60 });

    const body = registerSchema.parse(await req.json());
    const email = body.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return jsonError("Email already registered", 409);

    const passwordHash = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: body.name,
      },
      select: { id: true, email: true, role: true, name: true },
    });

    await provisionPanelAccessForUser(user);

    await createSessionForUser({ id: user.id, email: user.email, role: user.role });

    return jsonOk({ id: user.id, email: user.email, role: user.role });
  } catch (err: any) {
    const status = err?.status ?? 400;
    return jsonError(err?.message ?? "Bad Request", status);
  }
}
