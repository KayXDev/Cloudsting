"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { useLanguage } from "@/components/LanguageProvider";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  createCookieConsentValue,
  getCookieConsentCopy,
  parseCookieConsentValue,
} from "@/lib/cookieConsent";

type ConsentState = {
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

function readConsentCookie() {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${COOKIE_CONSENT_COOKIE_NAME}=`));

  if (!match) return null;
  return parseCookieConsentValue(decodeURIComponent(match.split("=").slice(1).join("=")));
}

function writeConsentCookie(value: ConsentState) {
  const serialized = encodeURIComponent(createCookieConsentValue(value));
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${serialized}; Max-Age=31536000; Path=/; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
}

export function CookieConsentBanner() {
  const { lang } = useLanguage();
  const copy = getCookieConsentCopy(lang);
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [state, setState] = useState<ConsentState>({
    preferences: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const current = readConsentCookie();
    if (!current) {
      setVisible(true);
      return;
    }

    setState({
      preferences: current.preferences,
      analytics: current.analytics,
      marketing: current.marketing,
    });
    setVisible(false);
  }, []);

  function save(next: ConsentState) {
    writeConsentCookie(next);
    setState(next);
    setVisible(false);
    setCustomizing(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-4 sm:px-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[#07110d]/95 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl">
        <div className="bg-[radial-gradient(circle_at_top_left,rgba(89,255,168,0.18),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface1)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--accent2)]">
                {copy.badge}
              </div>
              <h2 className="mt-3 text-xl font-extrabold tracking-tight text-[color:var(--text)] sm:text-2xl">
                {copy.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
                {copy.body}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button onClick={() => save({ preferences: false, analytics: false, marketing: false })} variant="ghost">
                {copy.rejectOptional}
              </Button>
              <Button onClick={() => setCustomizing((current) => !current)} variant="secondary">
                {customizing ? copy.saveChoices : copy.customize}
              </Button>
              <Button onClick={() => save({ preferences: true, analytics: true, marketing: true })}>
                {copy.acceptAll}
              </Button>
            </div>
          </div>

          {customizing ? (
            <div className="mt-5 grid gap-3 border-t border-[color:var(--border)] pt-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface1)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-[color:var(--text)]">{copy.essentialTitle}</div>
                    <div className="mt-2 text-xs leading-6 text-[color:var(--muted)]">{copy.essentialBody}</div>
                  </div>
                  <span className="rounded-full bg-[color:var(--surface2)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--accent2)]">
                    {copy.alwaysOn}
                  </span>
                </div>
              </div>

              {[
                { key: "preferences", title: copy.preferencesTitle, body: copy.preferencesBody },
                { key: "analytics", title: copy.analyticsTitle, body: copy.analyticsBody },
                { key: "marketing", title: copy.marketingTitle, body: copy.marketingBody },
              ].map((item) => (
                <label key={item.key} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface1)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-[color:var(--text)]">{item.title}</div>
                      <div className="mt-2 text-xs leading-6 text-[color:var(--muted)]">{item.body}</div>
                      <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#89a99a]">{copy.currentlyInactive}</div>
                    </div>
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-[color:var(--accent)]"
                      checked={state[item.key as keyof ConsentState]}
                      onChange={(event) => setState((current) => ({ ...current, [item.key]: event.target.checked }))}
                    />
                  </div>
                </label>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border)] pt-4 text-xs text-[color:var(--muted)]">
            <div>{copy.categoriesTitle}</div>
            <div className="flex items-center gap-3">
              <Link className="font-semibold text-[color:var(--accent2)] transition hover:text-[color:var(--text)]" href="/cookies">
                {copy.learnMore}
              </Link>
              {customizing ? (
                <Button variant="secondary" onClick={() => save(state)}>
                  {copy.saveChoices}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}