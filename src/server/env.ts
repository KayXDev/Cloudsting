import { z } from "zod";

function emptyStringToUndefined(v: unknown) {
  if (typeof v === "string" && v.trim() === "") return undefined;
  return v;
}

const optionalString = z.preprocess(emptyStringToUndefined, z.string().min(1).optional());
const optionalUrl = z.preprocess(emptyStringToUndefined, z.string().url().optional());
const optionalInt = z.preprocess(emptyStringToUndefined, z.coerce.number().int().positive().optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1),

  // Minecraft public addressing (used for public stats / server list pings)
  MC_PUBLIC_HOST_SUFFIX: optionalString.default(".mcsh.io"),
  MC_PUBLIC_DEFAULT_PORT: optionalInt.default(25565),

  REDIS_URL: optionalString,

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 30),

  APP_URL: z.string().url().default("http://localhost:3000"),

  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,

  PAYPAL_CLIENT_ID: optionalString,
  PAYPAL_CLIENT_SECRET: optionalString,
  PAYPAL_WEBHOOK_ID: optionalString,
  PAYPAL_ENV: z.enum(["sandbox", "live"]).default("sandbox"),

  GOOGLE_CLIENT_ID: optionalString,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: optionalString,

  SMTP_HOST: optionalString,
  SMTP_PORT: optionalInt,
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,
  SMTP_FROM: optionalString,

  SUPPORT_INBOX: optionalString,
  DISCORD_PURCHASE_WEBHOOK_URL: optionalUrl,

  PTERO_URL: optionalUrl,
  PTERO_APPLICATION_API_KEY: optionalString,
  PTERO_CLIENT_API_KEY: optionalString,
  PTERO_AUTO_CREATE_USER: z.coerce.boolean().default(false),
  PTERO_DEFAULT_EGG_ID: optionalInt,
  PTERO_DEFAULT_DOCKER_IMAGE: optionalString,
  PTERO_DEFAULT_STARTUP: optionalString,
  PTERO_DEFAULT_ENV: optionalString,

  // Paymenter (external billing panel)
  PAYMENTER_URL: optionalUrl,
  PAYMENTER_API_KEY: optionalString,
  PAYMENTER_CURRENCY_CODE: z.preprocess(emptyStringToUndefined, z.string().min(3).max(3).optional()).default("USD"),
  // JSON mapping: {"our-plan-slug": {"productId": 1, "planId": 2}}
  PAYMENTER_SERVICE_MAPPING: optionalString,
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

function readProcessEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    MC_PUBLIC_HOST_SUFFIX: process.env.MC_PUBLIC_HOST_SUFFIX,
    MC_PUBLIC_DEFAULT_PORT: process.env.MC_PUBLIC_DEFAULT_PORT,
    REDIS_URL: process.env.REDIS_URL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_TTL_SECONDS: process.env.JWT_ACCESS_TTL_SECONDS,
    JWT_REFRESH_TTL_SECONDS: process.env.JWT_REFRESH_TTL_SECONDS,
    APP_URL: process.env.APP_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID,
    PAYPAL_ENV: process.env.PAYPAL_ENV,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    SUPPORT_INBOX: process.env.SUPPORT_INBOX,
    DISCORD_PURCHASE_WEBHOOK_URL: process.env.DISCORD_PURCHASE_WEBHOOK_URL,
    PTERO_URL: process.env.PTERO_URL,
    PTERO_APPLICATION_API_KEY: process.env.PTERO_APPLICATION_API_KEY,
    PTERO_CLIENT_API_KEY: process.env.PTERO_CLIENT_API_KEY,
    PTERO_AUTO_CREATE_USER: process.env.PTERO_AUTO_CREATE_USER,
    PTERO_DEFAULT_EGG_ID: process.env.PTERO_DEFAULT_EGG_ID,
    PTERO_DEFAULT_DOCKER_IMAGE: process.env.PTERO_DEFAULT_DOCKER_IMAGE,
    PTERO_DEFAULT_STARTUP: process.env.PTERO_DEFAULT_STARTUP,
    PTERO_DEFAULT_ENV: process.env.PTERO_DEFAULT_ENV,

    PAYMENTER_URL: process.env.PAYMENTER_URL,
    PAYMENTER_API_KEY: process.env.PAYMENTER_API_KEY,
    PAYMENTER_CURRENCY_CODE: process.env.PAYMENTER_CURRENCY_CODE,
    PAYMENTER_SERVICE_MAPPING: process.env.PAYMENTER_SERVICE_MAPPING,
  };
}

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse(readProcessEnv());
  if (!parsed.success) {
    throw parsed.error;
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}

export const env: Env = new Proxy({} as Env, {
  get(_target, prop) {
    const resolved = getEnv();
    return (resolved as any)[prop as any];
  },
});
