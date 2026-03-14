import { cookies } from "next/headers";
import { isLangCode, type LangCode } from "@/lib/i18n";

const LANG_COOKIE = "kx_lang";

export function getLanguageFromCookies(): LangCode {
  const value = cookies().get(LANG_COOKIE)?.value;
  if (isLangCode(value)) return value;
  return "es";
}

export const langCookieName = LANG_COOKIE;
