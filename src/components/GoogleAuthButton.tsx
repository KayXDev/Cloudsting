"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleAuthButton(props: { mode: "login" | "register" }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const renderedRef = useRef(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [scriptReady, setScriptReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      setScriptReady(true);
    }
  }, []);

  useEffect(() => {
    renderedRef.current = false;
  }, [lang, props.mode]);

  useEffect(() => {
    if (!clientId || !scriptReady || !containerRef.current || !buttonRef.current || !window.google || renderedRef.current) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential?: string }) => {
        if (!response?.credential) {
          setError(t(lang, "auth.googleFailed"));
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ credential: response.credential }),
          });
          const json = await res.json();
          if (!res.ok || !json.ok) {
            throw new Error(json?.error?.message ?? t(lang, "auth.googleFailed"));
          }
          router.push("/dashboard");
          router.refresh();
        } catch (err: any) {
          setError(err?.message ?? t(lang, "auth.googleFailed"));
        } finally {
          setLoading(false);
        }
      },
      context: props.mode === "register" ? "signup" : "signin",
      ux_mode: "popup",
      cancel_on_tap_outside: true,
    });

    containerRef.current.innerHTML = "";
    const buttonWidth = Math.max(280, Math.round(buttonRef.current.getBoundingClientRect().width));
    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "pill",
      text: props.mode === "register" ? "signup_with" : "continue_with",
      logo_alignment: "left",
      width: buttonWidth,
      locale: lang,
    });
    renderedRef.current = true;
  }, [clientId, lang, props.mode, router, scriptReady]);

  if (!clientId) {
    return null;
  }

  return (
    <div className="grid gap-3">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setScriptReady(true)} />
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
        <span className="h-px flex-1 bg-[color:var(--border)]" />
        <span>{t(lang, "auth.orContinueWith")}</span>
        <span className="h-px flex-1 bg-[color:var(--border)]" />
      </div>
      <div ref={buttonRef} className="relative">
        <div className={`inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-4 py-2 text-sm font-semibold text-[color:var(--text)] transition hover:bg-[color:var(--surface3)] ${loading ? "opacity-70" : ""}`}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.8-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.6C16.8 2.9 14.7 2 12 2 6.9 2 2.8 6.5 2.8 12s4.1 10 9.2 10c5.3 0 8.8-3.8 8.8-9.1 0-.6-.1-1.1-.2-1.6H12Z" />
            <path fill="#34A853" d="M2.8 12c0 5.5 4.1 10 9.2 10 5.3 0 8.8-3.8 8.8-9.1 0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.8-6-6.2Z" opacity="0.001" />
            <path fill="#FBBC05" d="M4.9 7.2 8 9.5c.8-2.4 3-4 5.8-4 1.9 0 3.1.8 3.8 1.5l2.6-2.6C16.8 2.9 14.7 2 12 2 8 2 4.5 4.3 2.8 7.7l2.1-.5Z" />
            <path fill="#4285F4" d="M12 22c2.6 0 4.7-.9 6.3-2.5l-3-2.5c-.8.6-1.9 1-3.3 1-3.2 0-5.9-2.2-6.9-5.1l-3 .2C3.7 18.3 7.5 22 12 22Z" />
            <path fill="#34A853" d="M5.1 12.9A6.5 6.5 0 0 1 4.8 11c0-.7.1-1.3.3-1.9l-3-.2A10 10 0 0 0 1.8 11c0 1.6.4 3.1 1.1 4.4l2.2-1.7Z" />
          </svg>
          <span>{t(lang, "auth.googleContinue")}</span>
        </div>
        <div className="absolute inset-0 z-10 overflow-hidden rounded-xl opacity-0">
          <div ref={containerRef} className="flex h-full w-full items-center justify-center" />
        </div>
      </div>
      {loading ? <div className="text-center text-xs font-semibold text-[color:var(--muted)]">{t(lang, "common.working")}</div> : null}
      {error ? <div className="text-center text-xs font-semibold text-[color:var(--danger)]">{error}</div> : null}
    </div>
  );
}