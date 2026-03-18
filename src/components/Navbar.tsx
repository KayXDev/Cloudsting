"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/Container";
import { LogoutButton } from "@/components/LogoutButton";
import { totalCentsForInterval } from "@/lib/billingTerms";
import { readCart, removeCartItem, type CartItem } from "@/lib/cart";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function RoleBadge(props: { role: "USER" | "ADMIN" }) {
  const isAdmin = props.role === "ADMIN";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
        isAdmin
          ? "border-[#1AD76F]/40 bg-[#1AD76F]/10 text-[#7fe0aa]"
          : "border-[#2f3a34] bg-[#141917] text-[#b7c2bc]"
      }`}
    >
      {isAdmin ? "ADMIN" : "USER"}
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const headerRef = useRef<HTMLElement | null>(null);

  const links = [
    { href: "/", label: t(lang, "nav.home") },
    { href: "/pricing", label: t(lang, "nav.createServer") },
    { href: "/support", label: t(lang, "footer.support") },
  ];

  const communityLinks = [
    { href: "/community/forum", label: t(lang, "nav.forum") },
    { href: "/community/reviews", label: t(lang, "nav.reviews") },
    { href: "/community/server-list", label: t(lang, "nav.serverList") },
    { href: "/community/search", label: t(lang, "nav.search") },
  ];

  const [user, setUser] = useState<{ id: string; email: string; role: "USER" | "ADMIN"; name?: string | null; walletBalanceCents: number } | null>(null);
  const [userServers, setUserServers] = useState<Array<{ id: string; name: string; status: string }>>([]);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [serversOpen, setServersOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  async function fetchWithRetry(url: string, init?: RequestInit) {
    let lastResponse: Response | null = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(url, init);
      lastResponse = response;

      if (response.ok || (response.status !== 404 && response.status < 500)) {
        return response;
      }

      if (attempt < 2) {
        await new Promise((resolve) => window.setTimeout(resolve, 250 * (attempt + 1)));
      }
    }

    if (!lastResponse) {
      throw new Error(`Request failed without response: ${url}`);
    }

    return lastResponse;
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchWithRetry("/api/auth/me", { credentials: "same-origin" });

        if (!res.ok) {
          if (!cancelled && (res.status === 401 || res.status === 403)) {
            setUser(null);
            setUserServers([]);
          }
          return;
        }

        const json = await res.json().catch(() => null);
        if (!cancelled && json?.ok && json?.data?.id) {
          setUser(json.data);

          const serversRes = await fetchWithRetry("/api/servers", { credentials: "same-origin" });

          if (!serversRes.ok) {
            if (!cancelled && (serversRes.status === 401 || serversRes.status === 403)) {
              setUserServers([]);
            }
            return;
          }

          const serversJson = await serversRes.json().catch(() => null);
          if (!cancelled && serversJson?.ok && Array.isArray(serversJson?.data)) {
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
        return;
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pathname, lang]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!headerRef.current) return;
      if (!headerRef.current.contains(e.target as Node)) {
        setCommunityOpen(false);
        setWalletOpen(false);
        setServersOpen(false);
        setCartOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    function syncCart() {
      const items = readCart();
      setCartItems(items);
      setCartCount(items.length);
    }

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("cloudsting-cart-change", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("cloudsting-cart-change", syncCart);
    };
  }, []);

  useEffect(() => {
    setWalletOpen(false);
    setServersOpen(false);
    setCartOpen(false);
    setProfileOpen(false);
    setCommunityOpen(false);
    setMobileOpen(false);
    setMobileCommunityOpen(false);
  }, [pathname]);

  const navItemClass =
    "inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold leading-none transition";
  const compactIconButtonClass =
    "relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-200 transition hover:bg-[#171717]";

  const moneyFmt = new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-US", {
    style: "currency",
    currency: "USD",
  });
  const cartPreviewItems = cartItems.slice(0, 3);
  const cartEstimatedTotal = cartItems.reduce((sum, item) => sum + totalCentsForInterval(item.priceMonthlyCents, item.interval), 0);

  function handleRemoveCartItem(id: string) {
    removeCartItem(id);
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-[#1e1e1e] bg-[#0a0a0a]/95 backdrop-blur-xl">
      <Container className="flex min-h-16 max-w-none items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:h-16 lg:px-10 lg:py-0">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5 lg:gap-6">
          <Link href="/" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 self-center">
            <Image
              src="/kx-minecraft-mark.svg"
              alt="Cloudsting"
              width={62}
              height={54}
              className="relative -top-1 block h-11 w-auto max-w-none sm:h-12"
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

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setCommunityOpen((v) => !v);
                  setWalletOpen(false);
                  setServersOpen(false);
                  setProfileOpen(false);
                }}
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
          <div className="relative hidden items-center gap-2 lg:flex">

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setWalletOpen((v) => !v);
                  setCommunityOpen(false);
                  setServersOpen(false);
                  setCartOpen(false);
                  setProfileOpen(false);
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
                  <div className="rounded-lg border border-[#232323] px-3 py-2">
                    <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500">{t(lang, "wallet.cards.balance")}</div>
                    <div className="mt-1 text-sm font-extrabold text-white">{moneyFmt.format((user.walletBalanceCents ?? 0) / 100)}</div>
                  </div>
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
                  setCommunityOpen(false);
                  setWalletOpen(false);
                  setCartOpen(false);
                  setProfileOpen(false);
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

            <div className="relative">
              <button
                type="button"
                aria-label={t(lang, "nav.cart")}
                title={t(lang, "nav.cart")}
                onClick={() => {
                  setCartOpen((v) => !v);
                  setCommunityOpen(false);
                  setWalletOpen(false);
                  setServersOpen(false);
                  setProfileOpen(false);
                }}
                className={`${compactIconButtonClass} ${cartOpen ? "bg-[#171717]" : ""}`}
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M3 4.5H5.2L6.4 11.5H14.8L16.5 6.5H7.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="8.2" cy="15.2" r="1.2" fill="currentColor" />
                  <circle cx="13.8" cy="15.2" r="1.2" fill="currentColor" />
                </svg>
                {cartCount > 0 ? <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#1AD76F] px-1.5 py-0.5 text-[10px] font-extrabold text-black">{cartCount}</span> : null}
              </button>

              {cartOpen ? (
                <div className="absolute left-0 top-full z-[70] mt-2 w-72 rounded-xl border border-[#2a2a2a] bg-[#111111] p-2 shadow-[0_16px_30px_rgba(0,0,0,0.42)]">
                  <div className="rounded-lg border border-[#232323] px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500">{t(lang, "cart.summary")}</div>
                      <div className="text-xs font-semibold text-gray-400">{t(lang, "cart.items").replace("{count}", String(cartCount))}</div>
                    </div>
                    <div className="mt-2 text-sm font-extrabold text-white">{formatUsd(cartEstimatedTotal)}</div>
                  </div>

                  <div className="mt-2 grid gap-1">
                    {cartPreviewItems.length === 0 ? (
                      <div className="rounded-lg px-3 py-2 text-sm text-gray-400">{t(lang, "cart.empty")}</div>
                    ) : (
                      cartPreviewItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 rounded-lg px-3 py-2 hover:bg-[#1a1a1a]">
                          <Link
                            href={`/checkout/${item.planSlug}?cartItem=${item.id}`}
                            className="min-w-0 flex-1"
                            onClick={() => setCartOpen(false)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-gray-100">{item.planName}</div>
                                <div className="mt-1 truncate text-xs text-gray-500">{item.serverName}</div>
                              </div>
                              <div className="shrink-0 text-xs font-bold text-[#7fe0aa]">{formatUsd(totalCentsForInterval(item.priceMonthlyCents, item.interval))}</div>
                            </div>
                          </Link>
                          <button
                            type="button"
                            aria-label={t(lang, "cart.remove")}
                            title={t(lang, "cart.remove")}
                            onClick={() => handleRemoveCartItem(item.id)}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2a2a2a] text-gray-400 transition hover:border-[#4a2a2a] hover:bg-[#211313] hover:text-[#ff8d8d]"
                          >
                            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                              <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <Link href="/cart" className="rounded-lg border border-[#2a2a2a] px-3 py-2 text-center text-sm font-semibold text-gray-200 hover:bg-[#1a1a1a]" onClick={() => setCartOpen(false)}>
                      {t(lang, "cart.summary")}
                    </Link>
                    <Link href="/cart" className="rounded-lg bg-[#1AD76F] px-3 py-2 text-center text-sm font-extrabold text-black hover:bg-[#15b85e]" onClick={() => setCartOpen(false)}>
                      {t(lang, "cart.checkout")}
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>

            <span className="mx-1 h-8 w-px bg-[#2a2a2a]" />

            {user.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="inline-flex h-10 items-center rounded-lg border border-[#1AD76F]/40 bg-[#1AD76F]/10 px-3 text-sm font-bold text-[#1AD76F] hover:bg-[#1AD76F]/20"
              >
                {t(lang, "nav.admin")}
              </Link>
            ) : null}

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setCommunityOpen(false);
                  setWalletOpen(false);
                  setServersOpen(false);
                  setCartOpen(false);
                }}
                className={`inline-flex h-10 max-w-[170px] items-center gap-2 rounded-lg px-3 text-sm font-semibold text-gray-200 hover:bg-[#171717] xl:max-w-[220px] ${profileOpen ? "bg-[#171717]" : ""}`}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#1AD76F]/40 bg-[#1AD76F]/10 text-[#1AD76F]">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                    <circle cx="10" cy="6.5" r="2.8" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M4 16C4 13.5 6.2 11.5 9 11.5H11C13.8 11.5 16 13.5 16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="truncate">{(user.name && user.name.trim()) ? user.name : user.email.split("@")[0]}</span>
                <svg viewBox="0 0 20 20" className={`h-4 w-4 transition-transform ${profileOpen ? "rotate-180" : "rotate-0"}`} fill="none" aria-hidden="true">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {profileOpen ? (
                <div className="absolute right-0 top-full z-[70] mt-2 w-56 rounded-xl border border-[#2a2a2a] bg-[#111111] p-2 shadow-[0_16px_30px_rgba(0,0,0,0.42)]">
                  <div className="mb-2 rounded-lg border border-[#232323] px-3 py-2">
                    <div className="text-xs font-semibold text-gray-400">{user.email}</div>
                    <div className="mt-2">
                      <RoleBadge role={user.role} />
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-[#1a1a1a]"
                    onClick={() => setProfileOpen(false)}
                  >
                    {t(lang, "nav.profile")}
                  </Link>
                  <LogoutButton
                    className="w-full justify-start rounded-lg px-3 text-sm font-semibold text-gray-200 hover:bg-[#1a1a1a]"
                    onLoggedOut={() => setProfileOpen(false)}
                  />
                </div>
              ) : null}
            </div>

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
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-[#1a1a1a] lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
            <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {t(lang, "nav.menu")}
        </button>
      </Container>

      {mobileOpen ? (
        <div className="border-t border-[#1e1e1e] bg-[#0d0d0d] lg:hidden">
          <Container className="grid gap-3 px-4 py-4 sm:px-6">
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
              <button
                type="button"
                onClick={() => setMobileCommunityOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-xs font-bold uppercase tracking-wide text-gray-500"
              >
                <span>{t(lang, "nav.community")}</span>
                <svg viewBox="0 0 20 20" className={`h-4 w-4 transition-transform ${mobileCommunityOpen ? "rotate-180" : "rotate-0"}`} fill="none" aria-hidden="true">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {mobileCommunityOpen ? (
                <div className="mt-1 grid gap-1">
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
              ) : null}
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
                <div className="rounded-xl border border-[#2a2a2a] bg-[#101010] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">{(user.name && user.name.trim()) ? user.name : user.email.split("@")[0]}</div>
                      <div className="mt-1 text-xs text-gray-500">{user.email}</div>
                    </div>
                    <RoleBadge role={user.role} />
                  </div>
                  <div className="mt-2 text-xs font-semibold text-[#1AD76F]">{t(lang, "wallet.cards.balance")}: {moneyFmt.format((user.walletBalanceCents ?? 0) / 100)}</div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Link
                      href="/profile"
                      className="rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-[#1a1a1a]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t(lang, "nav.profile")}
                    </Link>
                    <Link
                      href="/dashboard"
                      className="rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-[#1a1a1a]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t(lang, "nav.viewAll")}
                    </Link>
                    <Link
                      href="/wallet"
                      className="rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-[#1a1a1a]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t(lang, "nav.walletSummary")}
                    </Link>
                    <Link
                      href="/wallet/add-funds"
                      className="rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-[#1a1a1a]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t(lang, "nav.addFunds")}
                    </Link>
                    <Link
                      href="/billing"
                      className="rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-[#1a1a1a]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t(lang, "nav.invoicesSupport")}
                    </Link>
                    <Link
                      href="/support"
                      className="rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-[#1a1a1a]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t(lang, "footer.support")}
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl border border-[#2a2a2a] bg-[#101010] p-3">
                  <div className="text-xs font-bold uppercase tracking-[0.08em] text-gray-500">{t(lang, "nav.yourServers")}</div>
                  <div className="mt-3 grid gap-2">
                    {userServers.length === 0 ? (
                      <div className="rounded-lg border border-[#232323] px-3 py-2 text-sm text-gray-400">{t(lang, "nav.noServersYet")}</div>
                    ) : (
                      userServers.slice(0, 4).map((s) => (
                        <Link
                          key={s.id}
                          href="/dashboard"
                          className="flex items-center justify-between rounded-lg border border-[#232323] px-3 py-2 text-sm hover:bg-[#1a1a1a]"
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="max-w-[180px] truncate font-semibold text-gray-200">{s.name}</span>
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${s.status === "ACTIVE" ? "bg-[#1AD76F] text-black" : "bg-[#303030] text-gray-200"}`}>
                            {s.status}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

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
