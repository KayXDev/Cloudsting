import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "@/server/env";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export async function verifyGoogleIdToken(token: string) {
  const audience = env.GOOGLE_CLIENT_ID ?? env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!audience) {
    throw Object.assign(new Error("Google sign-in is not configured"), { status: 503 });
  }

  const { payload } = await jwtVerify(token, GOOGLE_JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience,
  });

  const sub = typeof payload.sub === "string" ? payload.sub : null;
  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : null;
  const name = typeof payload.name === "string" ? payload.name : null;
  const emailVerified = payload.email_verified === true;

  if (!sub || !email || !emailVerified) {
    throw Object.assign(new Error("Invalid Google account data"), { status: 401 });
  }

  return { sub, email, name };
}