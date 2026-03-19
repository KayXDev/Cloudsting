import { cookies, headers } from "next/headers";
import { DEFAULT_LANG, isLangCode, LANG_COOKIE_NAME, type LangCode } from "@/lib/i18n";

function normalizeLanguage(value: unknown): LangCode | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (isLangCode(normalized)) return normalized;

  const base = normalized.split(/[-_]/)[0];
  return isLangCode(base) ? base : null;
}

function readLanguageFromCookieHeader(cookieHeader: string | null): LangCode | null {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (rawName !== LANG_COOKIE_NAME) continue;
    return normalizeLanguage(rawValue.join("="));
  }

  return null;
}

function readLanguageFromAcceptLanguage(headerValue: string | null): LangCode | null {
  if (!headerValue) return null;

  for (const candidate of headerValue.split(",")) {
    const [value] = candidate.trim().split(";");
    const lang = normalizeLanguage(value);
    if (lang) return lang;
  }

  return null;
}

export function resolveLanguagePreference(...values: Array<unknown>): LangCode {
  for (const value of values) {
    const lang = normalizeLanguage(value);
    if (lang) return lang;
  }

  return DEFAULT_LANG;
}

export function getLanguageFromRequest(req: Request): LangCode {
  return resolveLanguagePreference(
    req.headers.get("x-kx-lang"),
    readLanguageFromCookieHeader(req.headers.get("cookie")),
    readLanguageFromAcceptLanguage(req.headers.get("accept-language")),
  );
}

export function getLanguageFromCookies(): LangCode {
  return resolveLanguagePreference(
    headers().get("x-kx-lang"),
    cookies().get(LANG_COOKIE_NAME)?.value,
    headers().get("accept-language"),
  );
}

export const langCookieName = LANG_COOKIE_NAME;
