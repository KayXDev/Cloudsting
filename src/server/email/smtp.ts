import nodemailer from "nodemailer";
import { env } from "@/server/env";

function extractAddress(value: string) {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] ?? value).trim();
}

function extractDisplayName(value: string) {
  const match = value.match(/^(.*?)\s*<[^>]+>\s*$/);
  return match?.[1]?.trim().replace(/^"|"$/g, "") ?? "";
}

function resolveFromAddress() {
  const smtpUser = env.SMTP_USER?.trim() ?? "";
  const configuredFrom = env.SMTP_FROM?.trim() ?? smtpUser;
  const displayName = extractDisplayName(configuredFrom);

  if (!smtpUser.includes("@")) {
    return configuredFrom;
  }

  return displayName ? { name: displayName, address: smtpUser } : smtpUser;
}

function resolveReplyToAddress() {
  return env.SUPPORT_INBOX?.trim() || env.SMTP_USER?.trim() || "";
}

export async function sendEmail(opts: { to: string; subject: string; text: string; html?: string }) {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM) {
    throw new Error("SMTP is not configured (SMTP_HOST/PORT/USER/PASS/FROM). ");
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: resolveFromAddress(),
    sender: env.SMTP_USER,
    replyTo: resolveReplyToAddress(),
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}
