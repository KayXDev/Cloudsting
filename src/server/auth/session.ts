import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/server/db";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "@/server/auth/jwt";
import { env } from "@/server/env";

const ACCESS_COOKIE = "kx_access";
const REFRESH_COOKIE = "kx_refresh";

function trySetCookie(
  name: string,
  value: string,
  options: Parameters<ReturnType<typeof cookies>["set"]>[2]
) {
  try {
    // In Next.js, cookie mutation is only allowed in Route Handlers / Server Actions.
    // Server Components may throw here; we intentionally swallow and continue.
    (cookies() as any).set(name, value, options);
  } catch {
    // no-op
  }
}

function setAccessCookie(access: string) {
  trySetCookie(ACCESS_COOKIE, access, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: env.JWT_ACCESS_TTL_SECONDS,
  });
}

function setRefreshCookie(refresh: string) {
  trySetCookie(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: env.JWT_REFRESH_TTL_SECONDS,
  });
}

export async function createSessionForUser(user: {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}) {
  const access = await signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refresh = await signRefreshToken({ sub: user.id });

  const refreshHash = crypto.createHash("sha256").update(refresh).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshHash,
      expiresAt,
    },
  });

  setAccessCookie(access);
  setRefreshCookie(refresh);
}

export async function clearSessionCookies() {
  trySetCookie(ACCESS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  trySetCookie(REFRESH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getAccessTokenFromCookies() {
  return cookies().get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshTokenFromCookies() {
  return cookies().get(REFRESH_COOKIE)?.value ?? null;
}

export async function requireUser() {
  const access = await getAccessTokenFromCookies();
  if (!access) throw Object.assign(new Error("Unauthorized"), { status: 401 });

  try {
    const payload = await verifyAccessToken(access);
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    // Attempt refresh
    const refresh = await getRefreshTokenFromCookies();
    if (!refresh) throw Object.assign(new Error("Unauthorized"), { status: 401 });

    const refreshPayload = await verifyRefreshToken(refresh);

    const refreshHash = crypto.createHash("sha256").update(refresh).digest("hex");
    const token = await prisma.refreshToken.findFirst({
      where: {
        userId: refreshPayload.sub,
        tokenHash: refreshHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!token) throw Object.assign(new Error("Unauthorized"), { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: refreshPayload.sub } });
    if (!user) throw Object.assign(new Error("Unauthorized"), { status: 401 });

    // Only mint a new access token; do NOT rotate refresh tokens here.
    // Rotating refresh tokens requires writing cookies, which is not allowed in Server Components.
    const newAccess = await signAccessToken({ sub: user.id, email: user.email, role: user.role });
    setAccessCookie(newAccess);

    return { id: user.id, email: user.email, role: user.role };
  }
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw Object.assign(new Error("Forbidden"), { status: 403 });
  return user;
}
