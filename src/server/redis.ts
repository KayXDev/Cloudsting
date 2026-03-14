import { createClient, type RedisClientType } from "redis";
import { env } from "@/server/env";

let redis: RedisClientType | null = null;
let lastRedisErrorAt = 0;

export async function getRedis(): Promise<RedisClientType> {
  if (!env.REDIS_URL) {
    throw new Error("REDIS_URL is required for caching/rate limiting.");
  }

  if (redis) return redis;

  redis = createClient({ url: env.REDIS_URL });
  redis.on("error", (err) => {
    const now = Date.now();
    // Surface error while keeping process alive, but avoid spamming logs.
    if (now - lastRedisErrorAt > 10_000) {
      lastRedisErrorAt = now;
      console.error("Redis error", err);
    }
  });

  if (!redis.isOpen) {
    try {
      await redis.connect();
    } catch (err) {
      redis = null;
      throw err;
    }
  }

  return redis;
}
