import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { jsonError, jsonOk } from "@/server/http";
import { rateLimitOrThrow } from "@/server/rateLimit";
import { hashPassword } from "@/server/auth/password";
import { createSessionForUser } from "@/server/auth/session";
import { PterodactylClient } from "@/server/pterodactyl/client";
import { sendEmail } from "@/server/email/smtp";
import { renderPanelAccessEmail } from "@/server/email/templates";

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

    // Optional: create a matching Pterodactyl panel user for link-out access.
    if (env.PTERO_AUTO_CREATE_USER && env.PTERO_URL && env.PTERO_APPLICATION_API_KEY) {
      try {
        const ptero = new PterodactylClient();
        const tempPassword = crypto.randomBytes(18).toString("base64url");
        const usernameBase = email.split("@")[0]?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16) || "cloud";
        const username = `${usernameBase}${crypto.randomBytes(2).toString("hex")}`.slice(0, 20);

        const firstName = user.name?.split(" ")[0] ?? "Cloudsting";
        const lastName = user.name?.split(" ").slice(1).join(" ") || "User";

        const created = await ptero.createUser({
          email,
          username,
          firstName,
          lastName,
          password: tempPassword,
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { pterodactylUserId: created.id },
        });

        // Best-effort: email panel login.
        try {
          const panel = process.env.NEXT_PUBLIC_PTERO_PANEL_URL ?? env.PTERO_URL ?? "";
          const mail = renderPanelAccessEmail({
            brandName: "Cloudsting",
            panelUrl: panel,
            email,
            temporaryPassword: tempPassword,
          });
          await sendEmail({ to: email, subject: mail.subject, text: mail.text, html: mail.html });
        } catch {
          // ignore email failures
        }
      } catch {
        // ignore panel user creation failures (can be linked later by admin)
      }
    }

    await createSessionForUser({ id: user.id, email: user.email, role: user.role });

    return jsonOk({ id: user.id, email: user.email, role: user.role });
  } catch (err: any) {
    const status = err?.status ?? 400;
    return jsonError(err?.message ?? "Bad Request", status);
  }
}
