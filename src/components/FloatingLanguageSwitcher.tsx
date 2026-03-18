"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { LANG_LABELS, SUPPORTED_LANGS, t, type LangCode } from "@/lib/i18n";

export function FloatingLanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const languages = SUPPORTED_LANGS.map((code) => ({
    code,
    native: LANG_LABELS[code].native,
    local: LANG_LABELS[code].localEs,
  }));

  const filteredLanguages = languages.filter((entry) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    return entry.native.toLowerCase().includes(normalized) || entry.local.toLowerCase().includes(normalized);
  });

  return (
    <div ref={wrapperRef} className="fixed bottom-4 left-4 z-40 md:bottom-6 md:left-6">
      {open ? (
        <div className="mb-3 w-[280px] rounded-2xl border border-[#24352d] bg-[#0d1210]/95 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7fe0aa]">{t(lang, "nav.language")}</div>
              <div className="mt-1 text-sm font-semibold text-white">{LANG_LABELS[lang].native}</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#22322a] text-gray-300 hover:bg-[#131a16]"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#22322a] bg-[#0a0f0d] px-3 py-2">
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-gray-500" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
              <path d="M13.5 13.5L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t(lang, "nav.languageSearch")}
              className="w-full bg-transparent text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
            />
          </div>

          <div className="mt-3 max-h-[240px] overflow-y-auto pr-1">
            <div className="grid gap-1">
              {filteredLanguages.map((entry) => {
                const active = entry.code === lang;
                return (
                  <button
                    key={entry.code}
                    type="button"
                    onClick={async () => {
                      await setLang(entry.code as LangCode);
                      setOpen(false);
                    }}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-left transition ${active ? "bg-[#13211a] text-[#7fe0aa]" : "text-gray-200 hover:bg-[#121816]"}`}
                  >
                    <span>
                      <span className="block text-sm font-semibold leading-5">{entry.native}</span>
                      <span className="block text-xs text-gray-500">{entry.local}</span>
                    </span>
                    {active ? (
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                        <path d="M4 10.5L8 14.5L16 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={t(lang, "nav.language")}
        title={t(lang, "nav.language")}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#274032] bg-[#0d1511]/90 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-[#101b15]"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#7fe0aa]" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.7" />
          <path d="M2 10H18M10 2C12 4 13 7 13 10C13 13 12 16 10 18C8 16 7 13 7 10C7 7 8 4 10 2Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  );
}