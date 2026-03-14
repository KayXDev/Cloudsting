"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function LogoutButton() {
  const router = useRouter();
  const { lang } = useLanguage();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={logout} className="h-10 px-3 leading-none">
      {t(lang, "nav.logout")}
    </Button>
  );
}
