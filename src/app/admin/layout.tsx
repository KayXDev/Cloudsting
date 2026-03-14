import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Container } from "@/components/Container";
import { AdminNav } from "@/components/AdminNav";
import { t } from "@/lib/i18n";
import { requireAdmin } from "@/server/auth/session";
import { getLanguageFromCookies } from "@/server/i18n";

export default async function AdminLayout(props: { children: ReactNode }) {
  const lang = getLanguageFromCookies();
  try {
    await requireAdmin();
  } catch {
    redirect("/login");
  }

  return (
    <main>
      <Container className="py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "admin.layout.title")}</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {t(lang, "admin.layout.subtitle")}
        </p>

        <div className="mt-6">
          <AdminNav />
        </div>

        <div className="mt-6">{props.children}</div>
      </Container>
    </main>
  );
}
