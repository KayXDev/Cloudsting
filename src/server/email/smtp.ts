import nodemailer from "nodemailer";
import { env } from "@/server/env";

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
    from: env.SMTP_FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}
