import { jsonOk } from "@/server/http";
import { prisma } from "@/server/db";
import { env } from "@/server/env";

export async function GET() {
  const startedAt = Date.now();
  let db = "down";

  try {
    await prisma.user.count();
    db = "up";
  } catch {
    db = "down";
  }

  const overall = db === "up" ? "ok" : "degraded";

  return jsonOk({
    status: overall,
    checks: {
      database: db,
      pterodactylConfigured: Boolean(env.PTERO_URL && env.PTERO_APPLICATION_API_KEY),
      stripeConfigured: Boolean(env.STRIPE_SECRET_KEY),
      paypalConfigured: Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET),
    },
    responseTimeMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  });
}
