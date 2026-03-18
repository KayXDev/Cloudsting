"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function LogoutButton(props: { className?: string; onLoggedOut?: () => void }) {
  const router = useRouter();
  const { lang } = useLanguage();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    props.onLoggedOut?.();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={logout} className={`h-10 px-3 leading-none ${props.className ?? ""}`}>
      {t(lang, "nav.logout")}
    </Button>
  );
}
