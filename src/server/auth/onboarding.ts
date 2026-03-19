import crypto from "crypto";
import { env } from "@/server/env";
import { prisma } from "@/server/db";
import { PterodactylClient } from "@/server/pterodactyl/client";
import { sendEmail } from "@/server/email/smtp";
import { renderPanelAccessEmail } from "@/server/email/templates";

export async function provisionPanelAccessForUser(user: { id: string; email: string; name?: string | null }) {
  if (!(env.PTERO_AUTO_CREATE_USER && env.PTERO_URL && env.PTERO_APPLICATION_API_KEY)) {
    return;
  }

  try {
    const ptero = new PterodactylClient();
    const existing = await ptero.findUserByEmail(user.email);

    if (existing) {
      await prisma.user.update({
        where: { id: user.id },
        data: { pterodactylUserId: existing.id },
      });
      return;
    }

    const tempPassword = crypto.randomBytes(18).toString("base64url");
    const usernameBase = user.email.split("@")[0]?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16) || "cloud";
    const username = `${usernameBase}${crypto.randomBytes(2).toString("hex")}`.slice(0, 20);

    const firstName = user.name?.split(" ")[0] ?? "Cloudsting";
    const lastName = user.name?.split(" ").slice(1).join(" ") || "User";

    const created = await ptero.createUser({
      email: user.email,
      username,
      firstName,
      lastName,
      password: tempPassword,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { pterodactylUserId: created.id },
    });

    try {
      const panel = process.env.NEXT_PUBLIC_PTERO_PANEL_URL ?? env.PTERO_URL ?? "";
      const mail = renderPanelAccessEmail({
        brandName: "Cloudsting",
        panelUrl: panel,
        email: user.email,
        temporaryPassword: tempPassword,
      });
      await sendEmail({ to: user.email, subject: mail.subject, text: mail.text, html: mail.html });
    } catch {
      // ignore email failures
    }
  } catch (err) {
    console.error("Panel access provisioning failed", err);
  }
}