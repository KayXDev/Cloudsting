import { cookies, headers } from "next/headers";
import { DEFAULT_LANG, isLangCode, LANG_COOKIE_NAME, type LangCode } from "@/lib/i18n";

export function getLanguageFromCookies(): LangCode {
  const headerValue = headers().get("x-kx-lang");
  if (isLangCode(headerValue)) return headerValue;

  const value = cookies().get(LANG_COOKIE_NAME)?.value;
  if (isLangCode(value)) return value;
  return DEFAULT_LANG;
}

export const langCookieName = LANG_COOKIE_NAME;
