import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/server/db";
import { jsonError, jsonOk } from "@/server/http";
import { rateLimitOrThrow } from "@/server/rateLimit";
import { hashPassword } from "@/server/auth/password";
import { createSessionForUser } from "@/server/auth/session";
import { verifyGoogleIdToken } from "@/server/auth/google";
import { provisionPanelAccessForUser } from "@/server/auth/onboarding";

const googleAuthSchema = z.object({
  credential: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    await rateLimitOrThrow({ key: `auth-google:${req.headers.get("x-forwarded-for") ?? "local"}`, limit: 20, windowSeconds: 60 });

    const body = googleAuthSchema.parse(await req.json());
    const googleUser = await verifyGoogleIdToken(body.credential);

    const linkedUser = await prisma.user.findFirst({
      where: { googleSub: googleUser.sub },
      select: { id: true, email: true, role: true, name: true, googleSub: true },
    });

    let user = linkedUser;

    if (!user) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email: googleUser.email },
        select: { id: true, email: true, role: true, name: true, googleSub: true },
      });

      if (existingByEmail) {
        if (existingByEmail.googleSub && existingByEmail.googleSub !== googleUser.sub) {
          return jsonError("This email is already linked to another Google account", 409);
        }

        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            googleSub: googleUser.sub,
            name: existingByEmail.name ?? googleUser.name,
          },
          select: { id: true, email: true, role: true, name: true, googleSub: true },
        });
      } else {
        const passwordHash = await hashPassword(`${crypto.randomUUID()}-${crypto.randomBytes(24).toString("hex")}`);
        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            googleSub: googleUser.sub,
            passwordHash,
            name: googleUser.name,
          },
          select: { id: true, email: true, role: true, name: true, googleSub: true },
        });

        await provisionPanelAccessForUser(user);
      }
    } else if (user.email !== googleUser.email || user.name !== googleUser.name) {
      const conflict = user.email !== googleUser.email
        ? await prisma.user.findUnique({ where: { email: googleUser.email }, select: { id: true } })
        : null;

      if (conflict && conflict.id !== user.id) {
        return jsonError("Google account email conflicts with another account", 409);
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: googleUser.email,
          name: googleUser.name ?? user.name,
        },
        select: { id: true, email: true, role: true, name: true, googleSub: true },
      });
    }

    await createSessionForUser({ id: user.id, email: user.email, role: user.role });

    return jsonOk({ id: user.id, email: user.email, role: user.role });
  } catch (err: any) {
    const status = err?.status ?? 400;
    return jsonError(err?.message ?? "Bad Request", status);
  }
}