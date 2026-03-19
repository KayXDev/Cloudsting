import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function extractAddress(value) {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] ?? value).trim();
}

function extractDisplayName(value) {
  const match = value.match(/^(.*?)\s*<[^>]+>\s*$/);
  return match?.[1]?.trim().replace(/^"|"$/g, "") ?? "";
}

function resolveFromAddress() {
  const smtpUser = requireEnv("SMTP_USER").trim();
  const configuredFrom = requireEnv("SMTP_FROM").trim();
  const displayName = extractDisplayName(configuredFrom);

  if (!smtpUser.includes("@")) {
    return configuredFrom;
  }

  return displayName ? { name: displayName, address: smtpUser } : smtpUser;
}

function money(amountCents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((amountCents ?? 0) / 100);
}

function buildReceipt(order) {
  const meta = order.metadata ?? {};
  const serverName = typeof meta.serverName === "string" && meta.serverName.trim().length > 0
    ? meta.serverName
    : "Minecraft Server";
  const planName = order.plan?.name ?? (typeof meta.planSlug === "string" ? meta.planSlug : "Hosting Plan");
  const providerLabel = {
    STRIPE: "Stripe",
    PAYPAL: "PayPal",
    WALLET: "Wallet",
  }[order.provider] ?? order.provider;
  const paidAt = order.paidAt ? new Date(order.paidAt).toLocaleString("en-US", { timeZone: "UTC" }) + " UTC" : "";
  const subject = `Your Cloudsting receipt for ${planName}`;
  const text = [
    "Thanks for your purchase from Cloudsting.",
    "",
    `Order ID: ${order.id}`,
    `Plan: ${planName}`,
    `Server: ${serverName}`,
    `Amount: ${money(order.amountCents)}`,
    `Provider: ${providerLabel}`,
    paidAt ? `Paid at: ${paidAt}` : null,
  ].filter(Boolean).join("\n");
  const html = `
    <div style="margin:0;padding:24px;background:#050708;font-family:Arial,sans-serif;color:#f6fff9;">
      <div style="max-width:720px;margin:0 auto;border:1px solid rgba(255,255,255,0.08);border-radius:32px;overflow:hidden;background:linear-gradient(180deg, rgba(13,18,18,0.96), rgba(8,10,10,0.985));box-shadow:0 26px 84px rgba(0,0,0,0.46);">
        <div style="padding:28px 28px 22px;background:radial-gradient(520px circle at 0% 0%, rgba(89,255,168,0.16), transparent 48%);border-bottom:1px solid rgba(255,255,255,0.07);">
          <div style="font-size:25px;font-weight:800;letter-spacing:-0.02em;">Cloudsting</div>
          <div style="margin-top:12px;font-size:30px;line-height:1.05;font-weight:800;">Your order is confirmed.</div>
          <div style="margin-top:12px;font-size:14px;line-height:1.8;color:rgba(227,241,235,0.72);">A redesigned receipt with clearer hierarchy, better spacing, and rounded panels throughout.</div>
        </div>
        <div style="padding:22px 28px 0;">
          <div style="border:1px solid rgba(89,255,168,0.18);border-radius:26px;background:linear-gradient(180deg, rgba(89,255,168,0.14), rgba(89,255,168,0.03));padding:18px 18px 16px;">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(217,255,235,0.74);">Total charged</div>
            <div style="margin-top:10px;font-size:34px;line-height:1;font-weight:800;color:#59ffa8;">${money(order.amountCents)}</div>
            <div style="margin-top:10px;font-size:13px;color:rgba(223,255,238,0.74);">${providerLabel}</div>
          </div>
        </div>
        <div style="padding:14px 28px 0;">
          <table style="width:100%;border-collapse:separate;border-spacing:0 12px;">
            <tr>
              <td style="width:50%;padding-right:8px;vertical-align:top;"><div style="border:1px solid rgba(255,255,255,0.07);border-radius:22px;background:rgba(255,255,255,0.025);padding:16px;"><div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(213,228,221,0.56);font-weight:700;">Order ID</div><div style="margin-top:10px;font-size:14px;line-height:1.7;font-weight:700;word-break:break-all;">${order.id}</div></div></td>
              <td style="width:50%;padding-left:8px;vertical-align:top;"><div style="border:1px solid rgba(255,255,255,0.07);border-radius:22px;background:rgba(255,255,255,0.025);padding:16px;"><div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(213,228,221,0.56);font-weight:700;">Plan</div><div style="margin-top:10px;font-size:15px;line-height:1.6;font-weight:700;">${planName}</div></div></td>
            </tr>
            <tr>
              <td style="width:50%;padding-right:8px;vertical-align:top;"><div style="border:1px solid rgba(255,255,255,0.07);border-radius:22px;background:rgba(255,255,255,0.025);padding:16px;"><div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(213,228,221,0.56);font-weight:700;">Server</div><div style="margin-top:10px;font-size:15px;line-height:1.6;font-weight:700;">${serverName}</div></div></td>
              <td style="width:50%;padding-left:8px;vertical-align:top;"><div style="border:1px solid rgba(255,255,255,0.07);border-radius:22px;background:rgba(255,255,255,0.025);padding:16px;"><div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(213,228,221,0.56);font-weight:700;">Paid at</div><div style="margin-top:10px;font-size:15px;line-height:1.6;font-weight:700;">${paidAt || "Now"}</div></div></td>
            </tr>
          </table>
        </div>
        <div style="padding:18px 28px 28px;">
          <div style="border:1px solid rgba(89,255,168,0.14);border-radius:24px;background:linear-gradient(90deg, rgba(89,255,168,0.10), rgba(89,255,168,0.025));padding:16px 18px;font-size:13px;line-height:1.8;color:rgba(228,244,237,0.78);">
            Manage billing, review infrastructure status, and keep every purchase tied to your hosting account without losing context.
          </div>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}

async function main() {
  const transporter = nodemailer.createTransport({
    host: requireEnv("SMTP_HOST"),
    port: Number(requireEnv("SMTP_PORT")),
    secure: Number(requireEnv("SMTP_PORT")) === 465,
    auth: {
      user: requireEnv("SMTP_USER"),
      pass: requireEnv("SMTP_PASS"),
    },
  });

  await transporter.verify();

  const orders = await prisma.order.findMany({
    where: {
      status: "PAID",
      paidAt: { not: null },
      OR: [
        { receiptEmailSentAt: null },
        { receiptEmailSentAt: { isSet: false } },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { email: true } },
      plan: { select: { name: true } },
    },
  });

  console.log(`Found ${orders.length} paid orders without receipt email.`);

  let sent = 0;
  for (const order of orders) {
    const receipt = buildReceipt(order);
    await transporter.sendMail({
      from: resolveFromAddress(),
      sender: requireEnv("SMTP_USER"),
      replyTo: process.env.SUPPORT_INBOX?.trim() || requireEnv("SMTP_USER"),
      to: order.user.email,
      subject: receipt.subject,
      text: receipt.text,
      html: receipt.html,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { receiptEmailSentAt: new Date() },
    });

    sent += 1;
    console.log(`Sent receipt for order ${order.id}`);
  }

  console.log(`Done. Sent ${sent} receipts.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });