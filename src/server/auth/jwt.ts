import { SignJWT, jwtVerify } from "jose";
import { env } from "@/server/env";

function getKey(secret: string) {
  return new TextEncoder().encode(secret);
}

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: "USER" | "ADMIN";
};

export async function signAccessToken(payload: AccessTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + env.JWT_ACCESS_TTL_SECONDS)
    .sign(getKey(env.JWT_ACCESS_SECRET));
}

export async function signRefreshToken(payload: { sub: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + env.JWT_REFRESH_TTL_SECONDS)
    .sign(getKey(env.JWT_REFRESH_SECRET));
}

export async function verifyAccessToken(token: string) {
  const res = await jwtVerify<AccessTokenPayload>(token, getKey(env.JWT_ACCESS_SECRET));
  return res.payload;
}

export async function verifyRefreshToken(token: string) {
  const res = await jwtVerify<{ sub: string }>(token, getKey(env.JWT_REFRESH_SECRET));
  return res.payload;
}
