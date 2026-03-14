"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isLangCode, LANG_LABELS, SUPPORTED_LANGS, type LangCode } from "@/lib/i18n";

type LanguageContextValue = {
  lang: LangCode;
  setLang: (lang: LangCode) => Promise<void>;
  label: { native: string; localEs: string };
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider(props: { initialLang: LangCode; children: React.ReactNode }) {
  const router = useRouter();
  const [lang, setLangState] = useState<LangCode>(props.initialLang);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      lang,
      label: LANG_LABELS[lang],
      setLang: async (next) => {
        if (!isLangCode(next)) return;
        if (!SUPPORTED_LANGS.includes(next)) return;
        setLangState(next);
        try {
          await fetch("/api/i18n/language", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ lang: next }),
          });
        } catch {
          // ignore
        }
        router.refresh();
      },
    };
  }, [lang, router]);

  return <LanguageContext.Provider value={value}>{props.children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
