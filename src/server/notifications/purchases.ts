import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { sendOrderReceiptEmail } from "@/server/email/receipts";
import { siteConfig } from "@/lib/seo";
import { resolveLanguagePreference } from "@/server/i18n";

type PurchaseProvider = "STRIPE" | "PAYPAL" | "WALLET";

type PurchaseEmbedInput = {
  orderId: string;
  amountCents: number;
  provider: PurchaseProvider;
  paidAt: Date;
  customerEmail: string;
  customerName?: string | null;
  customerLanguage: string;
  planName: string;
  planSlug: string;
  ramMb?: number | null;
  cpuPercent?: number | null;
  diskMb?: number | null;
  interval: string;
  serverName: string;
  serverStatus: string;
  orderStatus?: string;
  panelServerId?: number | null;
  nodeName?: string | null;
  nodeId?: number | null;
  allocationId?: number | null;
  appUrl: string;
  serverId?: string | null;
  isTest?: boolean;
};

const LOCALE_BY_LANG: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-PT",
  it: "it-IT",
  nl: "nl-NL",
  ru: "ru-RU",
  pl: "pl-PL",
  cs: "cs-CZ",
  hi: "hi-IN",
  tr: "tr-TR",
};

const LANGUAGE_BADGES: Record<string, { flag: string; nativeName: string }> = {
  en: { flag: "🇬🇧", nativeName: "English" },
  es: { flag: "🇪🇸", nativeName: "Español" },
  fr: { flag: "🇫🇷", nativeName: "Français" },
  de: { flag: "🇩🇪", nativeName: "Deutsch" },
  pt: { flag: "🇵🇹", nativeName: "Português" },
  it: { flag: "🇮🇹", nativeName: "Italiano" },
  nl: { flag: "🇳🇱", nativeName: "Nederlands" },
  ru: { flag: "🇷🇺", nativeName: "Русский" },
  pl: { flag: "🇵🇱", nativeName: "Polski" },
  cs: { flag: "🇨🇿", nativeName: "Čeština" },
  hi: { flag: "🇮🇳", nativeName: "हिन्दी" },
  tr: { flag: "🇹🇷", nativeName: "Türkçe" },
};

function toLocale(lang: string) {
  return LOCALE_BY_LANG[lang] ?? LOCALE_BY_LANG.en;
}

function decimalAmount(amountCents: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: env.PAYMENTER_CURRENCY_CODE ?? "USD",
  }).format(amountCents / 100);
}

function dateTime(value: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function providerTheme(provider: PurchaseProvider) {
  if (provider === "STRIPE") {
    return {
      color: 0x635bff,
      label: "Stripe",
      accent: "Stripe checkout captured successfully",
      iconPath: "/provider-stripe-badge.svg",
    };
  }

  if (provider === "PAYPAL") {
    return {
      color: 0x009cde,
      label: "PayPal",
      accent: "PayPal payment captured successfully",
      iconPath: "/provider-paypal-badge.svg",
    };
  }

  return {
    color: 0x59ffa8,
    label: "Wallet",
    accent: "Wallet balance charged successfully",
    iconPath: "/provider-wallet-badge.svg",
  };
}

function statusBadge(status: string) {
  const badges: Record<string, string> = {
    PAID: "🟢 PAID",
    PENDING: "🟡 PENDING",
    FAILED: "🔴 FAILED",
    REFUNDED: "⚪ REFUNDED",
    ACTIVE: "🟢 ACTIVE",
    PROVISIONING: "🟡 PROVISIONING",
    SUSPENDED: "🟠 SUSPENDED",
    ERROR: "🔴 ERROR",
    DELETED: "⚫ DELETED",
  };

  return badges[status] ?? status;
}

function languageBadge(lang: string) {
  const entry = LANGUAGE_BADGES[lang] ?? { flag: "🌐", nativeName: lang.toUpperCase() };
  return `${entry.flag} ${entry.nativeName} (${lang.toUpperCase()})`;
}

function intervalLabel(value: string) {
  const labels: Record<string, string> = {
    week: "Weekly",
    month: "Monthly",
    quarter: "Quarterly",
    year: "Yearly",
  };

  return labels[value] ?? value;
}

function formatPlanResources(input: { ramMb?: number | null; cpuPercent?: number | null; diskMb?: number | null }) {
  const ramGb = typeof input.ramMb === "number" ? (input.ramMb / 1024).toFixed(input.ramMb % 1024 === 0 ? 0 : 1) : null;
  const diskGb = typeof input.diskMb === "number" ? Math.round(input.diskMb / 1024) : null;
  const cpu = typeof input.cpuPercent === "number" ? `${input.cpuPercent}% CPU` : null;

  return [
    ramGb ? `${ramGb} GB RAM` : null,
    cpu,
    diskGb != null ? `${diskGb} GB Disk` : null,
  ].filter(Boolean).join(" • ") || "Plan resources pending";
}

function buildDiscordPurchaseEmbed(input: PurchaseEmbedInput) {
  const appUrl = input.appUrl.replace(/\/$/, "");
  const locale = toLocale(input.customerLanguage);
  const money = decimalAmount(input.amountCents, locale);
  const paidAtLabel = dateTime(input.paidAt, locale);
  const billingUrl = `${appUrl}/admin/billing`;
  const dashboardUrl = `${appUrl}/dashboard${input.serverId ? `?server=${input.serverId}#server-${input.serverId}` : ""}`;
  const provider = providerTheme(input.provider);
  const providerIconUrl = `${appUrl}${provider.iconPath}`;
  const recurringMonthly = input.interval === "year"
    ? input.amountCents / 12
    : input.interval === "quarter"
      ? input.amountCents / 3
      : input.interval === "week"
        ? input.amountCents * 52 / 12
        : input.amountCents;
  const monthlyRunRate = decimalAmount(Math.round(recurringMonthly), locale);
  const customerDisplay = input.customerName?.trim() ? `${input.customerName} <${input.customerEmail}>` : input.customerEmail;
  const paymentBadge = statusBadge(input.orderStatus ?? "PAID");
  const infraBadge = statusBadge(input.serverStatus);
  const isActiveLive = !input.isTest && input.serverStatus === "ACTIVE";
  const heroLine = input.isTest
    ? "## PREVIEW SIGNAL"
    : isActiveLive
      ? "## SERVER PROVISIONED"
      : "## LIVE PURCHASE CONFIRMED";
  const modeLine = input.isTest
    ? "`SANDBOX / ADMIN PREVIEW`"
    : isActiveLive
      ? "`PRODUCTION / SERVICE ACTIVE`"
      : "`PRODUCTION / CUSTOMER PAYMENT`";
  const accentLine = input.isTest
    ? `> This embed is a **visual test fire** for ${siteConfig.name}.`
    : isActiveLive
      ? `> The service is now **live** inside ${siteConfig.name}.`
      : `> Revenue event locked in for **${siteConfig.name}**.`;
  const title = input.isTest
    ? `🧪 ${provider.label} embed preview`
    : isActiveLive
      ? `🟢 ${provider.label} server live`
      : `🚨 ${provider.label} payment confirmed`;
  const authorName = input.isTest
    ? `Preview console • ${customerDisplay}`
    : isActiveLive
      ? `Provisioning feed • ${customerDisplay}`
      : `Revenue feed • ${customerDisplay}`;
  const summaryBlock = input.isTest
    ? [
        heroLine,
        modeLine,
        accentLine,
        `> ${provider.accent}`,
        `> Testing plan **${input.planName}** for **${input.customerName?.trim() || input.customerEmail}**.`,
        "",
        "**This message is intentionally louder than production email UI.**",
      ].join("\n")
    : isActiveLive
      ? [
          heroLine,
          modeLine,
          accentLine,
          `> ${provider.accent}`,
          `> Plan **${input.planName}** is paid and the server is already **ACTIVE** for **${input.customerName?.trim() || input.customerEmail}**.`,
          "",
          "**Provisioning completed. Specs and node assignment are confirmed below.**",
        ].join("\n")
      : [
          heroLine,
          modeLine,
          accentLine,
          `> ${provider.accent}`,
          `> Plan **${input.planName}** has been paid by **${input.customerName?.trim() || input.customerEmail}**.`,
          "",
          "**Order, margin signal, and infra state are summarized below.**",
        ].join("\n");
  const embedColor = isActiveLive ? 0x22c55e : provider.color;
  const planResources = formatPlanResources({
    ramMb: input.ramMb,
    cpuPercent: input.cpuPercent,
    diskMb: input.diskMb,
  });
  const nodeLabel = input.nodeName?.trim()
    ? `${input.nodeName}${input.nodeId ? ` (#${input.nodeId})` : ""}`
    : input.nodeId
      ? `Node #${input.nodeId}`
      : "Pending assignment";

  return {
    username: siteConfig.name,
    avatar_url: `${appUrl}/kx-minecraft-mark.svg`,
    embeds: [
      {
        author: {
          name: authorName,
          icon_url: `${appUrl}/kx-minecraft-mark.svg`,
        },
        title,
        description: summaryBlock,
        color: embedColor,
        url: billingUrl,
        timestamp: input.paidAt.toISOString(),
        thumbnail: {
          url: providerIconUrl,
        },
        image: {
          url: `${appUrl}/cloudsting-logo.svg`,
        },
        fields: [
          { name: "━━━ Customer", value: `**${customerDisplay}**`, inline: true },
          { name: "━━━ Provider", value: `**${provider.label}**`, inline: true },
          { name: "━━━ Language", value: `**${languageBadge(input.customerLanguage)}**`, inline: true },
          { name: "━━━ Plan", value: `**${input.planName}**\n> \`${input.planSlug}\``, inline: true },
          { name: "━━━ Billing", value: `**${intervalLabel(input.interval)}**`, inline: true },
          { name: "━━━ Server", value: `**${input.serverName}**`, inline: true },
          {
            name: isActiveLive ? "🧩 Provisioned plan specs" : "🧩 Plan specs",
            value: [
              `> **${planResources}**`,
              `> Node: **${nodeLabel}**`,
              `> Allocation: **${input.allocationId ? String(input.allocationId) : "Pending"}**`,
            ].join("\n"),
            inline: false,
          },
          {
            name: input.isTest ? "🧪 Preview economics" : "💸 Financial snapshot",
            value: [
              `> Collected: **${money}**`,
              `> Monthly run-rate: **${monthlyRunRate}**`,
              `> Order ref: \`${input.orderId}\``,
              input.isTest ? "> This value is demo data for Discord rendering." : "> This event has already entered the paid order flow.",
            ].join("\n"),
            inline: false,
          },
          {
            name: input.isTest ? "🛠 Preview infrastructure" : "🖥 Infrastructure",
            value: [
              `> Payment: **${paymentBadge}**`,
              `> Server: **${infraBadge}**`,
              `> Panel server ID: **${input.panelServerId ? String(input.panelServerId) : "Pending"}**`,
              `> Node route: **${nodeLabel}**`,
              `> Paid at: **${paidAtLabel}**`,
            ].join("\n"),
            inline: false,
          },
          {
            name: input.isTest ? "🔗 Preview links" : "🔗 Quick links",
            value: `> [Admin billing](${billingUrl})\n> [Customer dashboard](${dashboardUrl})`,
            inline: false,
          },
        ],
        footer: {
          text: input.isTest
            ? "Cloudsting Discord webhook preview • sandbox tone"
            : isActiveLive
              ? "Cloudsting purchase webhook • active service variant"
              : "Cloudsting purchase webhook • production tone",
        },
      },
    ],
  };
}

async function postDiscordWebhook(payload: unknown) {
  if (!env.DISCORD_PURCHASE_WEBHOOK_URL) {
    throw new Error("Discord purchase webhook URL is not configured");
  }

  const response = await fetch(env.DISCORD_PURCHASE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Discord webhook failed (${response.status}): ${body || response.statusText}`);
  }
}

async function sendDiscordPurchaseWebhook(orderId: string) {
  if (!env.DISCORD_PURCHASE_WEBHOOK_URL) {
    return false;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true, name: true, preferredLanguage: true } },
      plan: { select: { name: true, slug: true, ramMb: true, cpuPercent: true, diskMb: true } },
      server: { select: { id: true, name: true, status: true, pterodactylServerId: true, nodeId: true, allocationId: true, memoryMb: true, cpuPercent: true, diskMb: true } },
    },
  });

  if (!order || order.status !== "PAID" || !order.paidAt || order.discordPurchaseNotifiedAt) {
    return false;
  }

  const claimed = await prisma.order.updateMany({
    where: {
      id: order.id,
      status: "PAID",
      OR: [
        { discordPurchaseNotifiedAt: null },
        { discordPurchaseNotifiedAt: { isSet: false } },
      ],
    },
    data: {
      discordPurchaseNotifiedAt: new Date(),
    },
  });

  if (claimed.count === 0) {
    return false;
  }

  const meta = (order.metadata ?? {}) as Record<string, unknown>;
  const lang = resolveLanguagePreference(meta.language, order.user.preferredLanguage);
  const planName = order.plan?.name ?? String(meta.planSlug ?? "Hosting Plan");
  const planSlug = order.plan?.slug ?? String(meta.planSlug ?? "hosting-plan");
  const interval = typeof meta.interval === "string" ? meta.interval : "month";
  const serverName = order.server?.name
    ?? (typeof meta.serverName === "string" && meta.serverName.trim() ? meta.serverName : "Minecraft Server");
  const node = order.server?.nodeId
    ? await prisma.node.findUnique({
        where: { pterodactylNodeId: order.server.nodeId },
        select: { name: true },
      })
    : null;
  const payload = buildDiscordPurchaseEmbed({
    orderId: order.id,
    amountCents: order.amountCents,
    provider: order.provider,
    paidAt: order.paidAt,
    customerEmail: order.user.email,
    customerName: order.user.name,
    customerLanguage: lang,
    planName,
    planSlug,
    ramMb: order.server?.memoryMb ?? order.plan?.ramMb,
    cpuPercent: order.server?.cpuPercent ?? order.plan?.cpuPercent,
    diskMb: order.server?.diskMb ?? order.plan?.diskMb,
    interval,
    serverName,
    serverStatus: order.server?.status ?? "PROVISIONING",
    orderStatus: order.status,
    panelServerId: order.server?.pterodactylServerId,
    nodeName: node?.name,
    nodeId: order.server?.nodeId,
    allocationId: order.server?.allocationId,
    appUrl: env.APP_URL,
    serverId: order.server?.id,
  });

  try {
    await postDiscordWebhook(payload);

    return true;
  } catch (err) {
    await prisma.order.update({
      where: { id: order.id },
      data: { discordPurchaseNotifiedAt: null },
    }).catch(() => null);

    throw err;
  }
}

export async function sendOrderPurchaseNotifications(orderId: string) {
  const results = await Promise.allSettled([
    sendOrderReceiptEmail(orderId),
    sendDiscordPurchaseWebhook(orderId),
  ]);

  const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
  if (failures.length > 0) {
    throw new AggregateError(
      failures.map((failure) => failure.reason),
      `Purchase notifications failed for order ${orderId}`,
    );
  }

  return {
    receiptSent: results[0].status === "fulfilled" ? results[0].value : false,
    discordSent: results[1].status === "fulfilled" ? results[1].value : false,
  };
}

export async function sendDiscordPurchaseTestWebhook(input: {
  email: string;
  name?: string | null;
  lang?: string | null;
}) {
  const lang = resolveLanguagePreference(input.lang);
  const now = new Date();
  const payload = buildDiscordPurchaseEmbed({
    orderId: `preview-${Date.now()}`,
    amountCents: 1499,
    provider: "STRIPE",
    paidAt: now,
    customerEmail: input.email,
    customerName: input.name,
    customerLanguage: lang,
    planName: "Velocity Pro",
    planSlug: "velocity-pro",
    ramMb: 6144,
    cpuPercent: 180,
    diskMb: 20480,
    interval: "month",
    serverName: "KX Preview Cluster",
    serverStatus: "ACTIVE",
    orderStatus: "PAID",
    panelServerId: 99901,
    nodeName: "Madrid Edge 01",
    nodeId: 7,
    allocationId: 188,
    appUrl: env.APP_URL,
    serverId: null,
    isTest: true,
  });

  await postDiscordWebhook(payload);
  return true;
}