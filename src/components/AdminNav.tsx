"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function AdminNav() {
  const { lang } = useLanguage();
  const pathname = usePathname();

  const links = [
    { href: "/admin/overview", label: t(lang, "admin.nav.overview") },
    { href: "/admin/users", label: t(lang, "admin.nav.users") },
    { href: "/admin/servers", label: t(lang, "admin.nav.servers") },
    { href: "/admin/plans", label: t(lang, "admin.nav.plans") },
    { href: "/admin/forum", label: t(lang, "admin.nav.forum") },
    { href: "/admin/support", label: t(lang, "admin.nav.support") },
    { href: "/admin/infra", label: t(lang, "admin.nav.infra") },
    { href: "/admin/billing", label: t(lang, "admin.nav.billing") },
  ];

  return (
    <nav className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#2a2a2a] bg-[#0e0e0e] p-2">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
              active
                ? "bg-[#1AD76F] text-black"
                : "text-gray-300 hover:bg-[#171717] hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
