"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/Container";
import { LogoutButton } from "@/components/LogoutButton";
import { useLanguage } from "@/components/LanguageProvider";
import { t, type LangCode, LANG_LABELS } from "@/lib/i18n";

export function Navbar() {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();

  const links = [
    { href: "/", label: t(lang, "nav.home") },
    { href: "/pricing", label: t(lang, "nav.createServer") },
    { href: "/support", label: t(lang, "footer.support") },
  ];

  const communityLinks = [
    { href: "/community/forum", label: t(lang, "nav.forum") },
    { href: "/community/server-list", label: t(lang, "nav.serverList") },
    { href: "/community/search", label: t(lang, "nav.search") },
  ];

  const [user, setUser] = useState<{ id: string; email: string; role: "USER" | "ADMIN"; name?: string | null } | null>(null);
  const [userServers, setUserServers] = useState<Array<{ id: string; name: string; status: string }>>([]);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [closeTimer, setCloseTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [serversOpen, setServersOpen] = useState(false);
  const [languageQuery, setLanguageQuery] = useState("");
  const languageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "same-origin" });
        const json = await res.json().catch(() => null);
        if (!cancelled && res.ok && json?.ok && json?.data?.id) {
          setUser(json.data);

          const serversRes = await fetch("/api/servers", { credentials: "same-origin" });
          const serversJson = await serversRes.json().catch(() => null);
          if (!cancelled && serversRes.ok && serversJson?.ok && Array.isArray(serversJson?.data)) {
            setUserServers(
              serversJson.data.map((s: any) => ({
                id: String(s.id),
                name: String(s.name ?? t(lang, "nav.serverDefault")),
                status: String(s.status ?? "UNKNOWN"),
              }))
            );
          } else if (!cancelled) {
            setUserServers([]);
          }
        } else if (!cancelled) {
          setUser(null);
          setUserServers([]);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setUserServers([]);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pathname, lang]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!languageRef.current) return;
      if (!languageRef.current.contains(e.target as Node)) {
        setLanguageOpen(false);
        setWalletOpen(false);
        setServersOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    setLanguageOpen(false);
    setWalletOpen(false);
    setServersOpen(false);
    setCommunityOpen(false);
  }, [pathname]);

  const navItemClass =
    "inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold leading-none transition";

  const currentLanguage = LANG_LABELS[lang].native;

  const languages = [
    { code: "en", native: LANG_LABELS.en.native, local: LANG_LABELS.en.localEs },
    { code: "nl", native: LANG_LABELS.nl.native, local: LANG_LABELS.nl.localEs },
    { code: "ru", native: LANG_LABELS.ru.native, local: LANG_LABELS.ru.localEs },
    { code: "es", native: LANG_LABELS.es.native, local: LANG_LABELS.es.localEs },
    { code: "fr", native: LANG_LABELS.fr.native, local: LANG_LABELS.fr.localEs },
    { code: "de", native: LANG_LABELS.de.native, local: LANG_LABELS.de.localEs },
    { code: "pl", native: LANG_LABELS.pl.native, local: LANG_LABELS.pl.localEs },
    { code: "pt", native: LANG_LABELS.pt.native, local: LANG_LABELS.pt.localEs },
    { code: "cs", native: LANG_LABELS.cs.native, local: LANG_LABELS.cs.localEs },
    { code: "hi", native: LANG_LABELS.hi.native, local: LANG_LABELS.hi.localEs },
    { code: "tr", native: LANG_LABELS.tr.native, local: LANG_LABELS.tr.localEs },
    { code: "it", native: LANG_LABELS.it.native, local: LANG_LABELS.it.localEs },
  ];

  const filteredLanguages = languages.filter((l) => {
    const q = languageQuery.trim().toLowerCase();
    if (!q) return true;
    return l.native.toLowerCase().includes(q) || l.local.toLowerCase().includes(q);
  });

  function openCommunity() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      setCloseTimer(null);
    }
    setCommunityOpen(true);
  }

  function closeCommunityWithDelay() {
    const timer = setTimeout(() => {
      setCommunityOpen(false);
    }, 140);
    setCloseTimer(timer);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e1e1e] bg-[#0a0a0a]/95 backdrop-blur-xl">
      <Container className="flex h-16 max-w-none items-center justify-between px-16 sm:px-20">
        <div className="flex items-center gap-6">
          <Link href="/" className="inline-flex h-12 items-center justify-center gap-2 self-center">
            <Image
              src="/kx-minecraft-mark.svg"
              alt="Cloudsting"
              width={62}
              height={54}
              className="relative -top-1.5 block h-12 w-auto max-w-none"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`${navItemClass} ${
                  pathname === l.href
                    ? "bg-[#1a1a1a] text-[#1AD76F]"
                    : "text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}

            <div
              className="relative"
              onMouseEnter={openCommunity}
              onMouseLeave={closeCommunityWithDelay}
            >
              <button
                type="button"
                onClick={() => setCommunityOpen((v) => !v)}
                className={`${navItemClass} gap-2 ${
                  pathname.startsWith("/community")
                    ? "bg-[#1a1a1a] text-[#1AD76F]"
                    : "text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                {t(lang, "nav.community")}
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className={`h-4 w-4 transition-transform duration-200 ${communityOpen ? "rotate-180" : "rotate-0"}`}
                  aria-hidden="true"
                >
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {communityOpen ? (
                <div className="absolute left-0 top-full pt-2">
                  <div className="w-48 rounded-xl border border-[#2a2a2a] bg-[#111111] p-2 shadow-[0_14px_30px_rgba(0,0,0,0.45)]">
                    {communityLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                        onClick={() => setCommunityOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </nav>
        </div>

        {user ? (
          <div className="relative hidden items-center gap-3 lg:flex" ref={languageRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setLanguageOpen((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-gray-200 hover:bg-[#171717]"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M2 10H18M10 2C12 4 13 7 13 10C13 13 12 16 10 18C8 16 7 13 7 10C7 7 8 4 10 2Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>{currentLanguage}</span>
                <svg viewBox="0 0 20 20" className={`h-4 w-4 transition-transform ${languageOpen ? "rotate-180" : "rotate-0"}`} fill="none" aria-hidden="true">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {languageOpen ? (
                <div className="absolute left-0 top-full z-[70] mt-2 w-[380px] rounded-2xl border border-[#2A2A2A] bg-[#111215] shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
                  <div className="p-3">
                    <div className="flex items-center gap-2 rounded-xl border border-[#1AD76F]/55 bg-[#0c1016] px-3 py-2">
                      <svg viewBox="0 0 20 20" className="h-4 w-4 text-gray-400" fill="none" aria-hidden="true">
                        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M13.5 13.5L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                      <input
                        value={languageQuery}
                        onChange={(e) => setLanguageQuery(e.target.value)}
                        placeholder={t(lang, "nav.languageSearch")}
                        className="w-full bg-transparent text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto border-t border-[#25272d] p-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {filteredLanguages.map((lng) => {
                        const active = lng.code === lang;
                        return (
                          <button
                            key={lng.code}
                            type="button"
                            onClick={async () => {
                              await setLang(lng.code as LangCode);
                              setLanguageOpen(false);
                            }}
                            className="flex items-center justify-between text-left"
                          >
                            <span>
                              <span className={`block text-base font-bold leading-5 ${active ? "text-[#1AD76F]" : "text-gray-200"}`}>
                                {lng.native}
                              </span>
                              <span className="mt-0.5 block text-xs text-gray-500">{lng.local}</span>
                            </span>
                            {active ? (
                              <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#1AD76F]" fill="none" aria-hidden="true">
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
            </div>

            <span className="h-8 w-px bg-[#2a2a2a]" />

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setWalletOpen((v) => !v);
                  setServersOpen(false);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-gray-200 hover:bg-[#171717]"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
                  <rect x="2.5" y="4" width="15" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M2.5 8H17.5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                <span>{t(lang, "nav.wallet")}</span>
                <svg viewBox="0 0 20 20" className={`h-4 w-4 transition-transform ${walletOpen ? "rotate-180" : "rotate-0"}`} fill="none" aria-hidden="true">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {walletOpen ? (
                <div className="absolute left-0 top-full z-[70] mt-2 w-56 rounded-xl border border-[#2a2a2a] bg-[#111111] p-2 shadow-[0_16px_30px_rgba(0,0,0,0.42)]">
                  <Link href="/wallet" className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-[#1a1a1a]">
                    {t(lang, "nav.walletSummary")}
                  </Link>
                  <Link href="/wallet/add-funds" className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-[#1a1a1a]">
                    {t(lang, "nav.addFunds")}
                  </Link>
                  <Link href="/billing" className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-[#1a1a1a]">
                    {t(lang, "nav.invoicesSupport")}
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setServersOpen((v) => !v);
                  setWalletOpen(false);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-gray-200 hover:bg-[#171717]"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
                  <rect x="2" y="6" width="16" height="10" rx="3" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="6" cy="11" r="1.4" fill="currentColor" />
                  <circle cx="14" cy="11" r="1.4" fill="currentColor" />
                </svg>
                <span>{t(lang, "nav.servers")}</span>
                <svg viewBox="0 0 20 20" className={`h-4 w-4 transition-transform ${serversOpen ? "rotate-180" : "rotate-0"}`} fill="none" aria-hidden="true">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {serversOpen ? (
                <div className="absolute left-0 top-full z-[70] mt-2 w-72 rounded-xl border border-[#2a2a2a] bg-[#111111] p-2 shadow-[0_16px_30px_rgba(0,0,0,0.42)]">
                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500">{t(lang, "nav.yourServers")}</div>
                  <div className="mt-1 grid gap-1">
                    {userServers.length === 0 ? (
                      <div className="rounded-lg px-3 py-2 text-sm text-gray-400">{t(lang, "nav.noServersYet")}</div>
                    ) : (
                      userServers.slice(0, 8).map((s) => (
                        <Link key={s.id} href="/dashboard" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[#1a1a1a]">
                          <span className="max-w-[170px] truncate font-semibold text-gray-200">{s.name}</span>
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${s.status === "ACTIVE" ? "bg-[#1AD76F] text-black" : "bg-[#303030] text-gray-200"}`}>
                            {s.status}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                  <Link href="/dashboard" className="mt-2 block rounded-lg border border-[#2a2a2a] px-3 py-2 text-center text-sm font-semibold text-gray-200 hover:bg-[#1a1a1a]">
                    {t(lang, "nav.viewAll")}
                  </Link>
                </div>
              ) : null}
            </div>

            <span className="h-8 w-px bg-[#2a2a2a]" />

            {user.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="inline-flex h-10 items-center rounded-lg border border-[#1AD76F]/40 bg-[#1AD76F]/10 px-3 text-sm font-bold text-[#1AD76F] hover:bg-[#1AD76F]/20"
              >
                {t(lang, "nav.admin")}
              </Link>
            ) : null}

            <Link
              href="/profile"
              className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-gray-200 hover:bg-[#171717]"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#1AD76F]/40 bg-[#1AD76F]/10 text-[#1AD76F]">
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                  <circle cx="10" cy="6.5" r="2.8" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M4 16C4 13.5 6.2 11.5 9 11.5H11C13.8 11.5 16 13.5 16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <span>{(user.name && user.name.trim()) ? user.name : user.email.split("@")[0]}</span>
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

          </div>
        ) : (
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold leading-none text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
            >
              {t(lang, "auth.signIn")}
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center rounded-lg bg-[#1AD76F] px-4 text-sm font-extrabold leading-none text-black hover:bg-[#15b85e]"
            >
              {t(lang, "auth.register")}
            </Link>
          </div>
        )}

        <button
          type="button"
          className="inline-flex rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-[#1a1a1a] lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {t(lang, "nav.menu")}
        </button>
      </Container>

      {mobileOpen ? (
        <div className="border-t border-[#1e1e1e] bg-[#0d0d0d] lg:hidden">
          <Container className="grid gap-2 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}

            <div className="rounded-lg border border-[#2a2a2a] p-2">
              <div className="px-2 pb-1 text-xs font-bold uppercase tracking-wide text-gray-500">{t(lang, "nav.community")}</div>
              <div className="grid gap-1">
                {communityLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {!user ? (
              <div className="mt-1 flex gap-2">
                <Link
                  href="/login"
                  className="inline-flex flex-1 items-center justify-center rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(lang, "auth.signIn")}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#1AD76F] px-3 py-2 text-sm font-extrabold text-black hover:bg-[#15b85e]"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(lang, "auth.register")}
                </Link>
              </div>
            ) : (
              <div className="mt-1 grid gap-2">
                {user.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center rounded-lg border border-[#1AD76F]/40 bg-[#1AD76F]/10 px-3 py-2 text-sm font-bold text-[#1AD76F] hover:bg-[#1AD76F]/20"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin
                  </Link>
                ) : null}
                <LogoutButton />
              </div>
            )}
          </Container>
        </div>
      ) : null}
    </header>
  );
}
