import { getRedis } from "@/server/redis";
import { env } from "@/server/env";

let redisDisabledUntil = 0;

export async function rateLimitOrThrow(opts: {
  key: string;
  limit: number;
  windowSeconds: number;
}) {
  if (!env.REDIS_URL) {
    // Development-friendly fallback.
    return;
  }

  // If Redis was recently unreachable, skip rate limiting temporarily.
  if (Date.now() < redisDisabledUntil) return;

  let redis;
  try {
    redis = await getRedis();
  } catch (err) {
    if (env.NODE_ENV === "production") throw err;
    redisDisabledUntil = Date.now() + 30_000;
    return;
  }

  const now = Date.now();
  const windowKey = `rl:${opts.key}:${Math.floor(now / (opts.windowSeconds * 1000))}`;

  let count: number;
  try {
    count = await redis.incr(windowKey);
    if (count === 1) {
      await redis.expire(windowKey, opts.windowSeconds);
    }
  } catch (err) {
    if (env.NODE_ENV === "production") throw err;
    redisDisabledUntil = Date.now() + 30_000;
    return;
  }

  if (count > opts.limit) {
    const err = new Error("Rate limit exceeded");
    (err as any).status = 429;
    throw err;
  }
}
