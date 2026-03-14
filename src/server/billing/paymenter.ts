import { env } from "@/server/env";
import crypto from "crypto";

type PaymenterUserResource = {
  id: string;
  type: "users";
  attributes: {
    id: number;
    email: string;
  };
};

type PaymenterServiceResource = {
  id: string;
  type: "services";
  attributes: {
    id: number;
    status: string;
  };
};

type ServiceMappingEntry = { productId: number; planId: number };

type PaymenterServiceMapping = Record<string, ServiceMappingEntry>;

function getPaymenterApiBase(): string {
  if (!env.PAYMENTER_URL) throw new Error("PAYMENTER_URL is not set");
  // User might set PAYMENTER_URL as https://billing.example.com or https://billing.example.com/api
  const trimmed = env.PAYMENTER_URL.replace(/\/$/, "");

  if (trimmed.endsWith("/api")) return trimmed;

  // Some users paste the full versioned base (e.g. .../api/v1). Normalize to .../api.
  const versioned = trimmed.match(/^(.*\/api)\/v\d+$/);
  if (versioned) return versioned[1];

  return `${trimmed}/api`;
}

async function paymenterRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!env.PAYMENTER_API_KEY) {
    throw new Error("PAYMENTER_API_KEY is not set");
  }

  const base = getPaymenterApiBase();
  const url = `${base}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.PAYMENTER_API_KEY}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = new Error(`Paymenter API error ${res.status}: ${text}`);
    (err as any).status = res.status;
    (err as any).details = json;
    throw err;
  }

  return json as T;
}

function parseServiceMapping(): PaymenterServiceMapping | null {
  if (!env.PAYMENTER_SERVICE_MAPPING) return null;
  try {
    const parsed = JSON.parse(env.PAYMENTER_SERVICE_MAPPING);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as PaymenterServiceMapping;
  } catch {
    return null;
  }
}

function toNumericId(resource: { id?: string; attributes?: { id?: number } } | undefined | null): number | null {
  const attrId = resource?.attributes?.id;
  if (typeof attrId === "number" && Number.isFinite(attrId)) return attrId;

  const raw = resource?.id;
  const num = raw ? Number(raw) : NaN;
  return Number.isFinite(num) ? num : null;
}

async function findUserIdByEmail(email: string): Promise<number | null> {
  const res = await paymenterRequest<{ data: PaymenterUserResource[] }>(
    `/v1/admin/users?per_page=1&filter%5Bemail%5D=${encodeURIComponent(email)}`
  );
  const u = res.data?.[0];
  return toNumericId(u);
}

async function ensureUser(email: string): Promise<number> {
  const existingId = await findUserIdByEmail(email);
  if (existingId) return existingId;

  const password = crypto.randomBytes(18).toString("base64url");
  const created = await paymenterRequest<{ data: PaymenterUserResource }>(`/v1/admin/users`, {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const createdId = toNumericId(created.data);
  if (!createdId) throw new Error("Paymenter user creation returned no id");
  return createdId;
}

async function findServiceBySubscriptionId(subscriptionId: string): Promise<number | null> {
  const res = await paymenterRequest<{ data: PaymenterServiceResource[] }>(
    `/v1/admin/services?per_page=1&filter%5Bsubscription_id%5D=${encodeURIComponent(subscriptionId)}`
  );
  const s = res.data?.[0];
  return toNumericId(s);
}

async function createService(input: {
  productId: number;
  planId: number;
  userId: number;
  subscriptionId: string;
  price: number;
}) {
  return paymenterRequest<{ data: PaymenterServiceResource }>(`/v1/admin/services`, {
    method: "POST",
    body: JSON.stringify({
      product_id: input.productId,
      plan_id: input.planId,
      user_id: input.userId,
      quantity: 1,
      status: "active",
      currency_code: env.PAYMENTER_CURRENCY_CODE ?? "USD",
      price: input.price,
      subscription_id: input.subscriptionId,
    }),
  });
}

export async function ensurePaymenterServiceForOrder(opts: {
  orderId: string;
  planSlug: string;
  userEmail: string;
  priceCents: number;
}) {
  // No-op if not configured
  if (!env.PAYMENTER_URL || !env.PAYMENTER_API_KEY) return;

  const mapping = parseServiceMapping();
  if (!mapping) return;

  const entry = mapping[opts.planSlug];
  if (!entry) return;

  const subscriptionId = `kx_${opts.orderId}`;

  // Idempotency: if already created (webhook + success callback), do nothing.
  const existingServiceId = await findServiceBySubscriptionId(subscriptionId);
  if (existingServiceId) return;

  const userId = await ensureUser(opts.userEmail);

  await createService({
    productId: entry.productId,
    planId: entry.planId,
    userId,
    subscriptionId,
    price: Number((opts.priceCents / 100).toFixed(2)),
  });
}
