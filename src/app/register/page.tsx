import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { RegisterForm } from "@/components/RegisterForm";
import { createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Register",
    description: "Create a Cloudsting account to launch and manage Minecraft hosting plans.",
    path: "/register",
    noIndex: true,
  });
}

export default function RegisterPage() {
  const lang = getLanguageFromCookies();

  return (
    <main>
      <Container className="py-16">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "auth.registerTitle")}</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {t(lang, "auth.alreadyHaveAccount")} {" "}
            <Link href="/login" className="text-[color:var(--accent)]">{t(lang, "auth.loginLink")}</Link>.
          </p>

          <Card className="mt-8 p-6">
            <RegisterForm />
          </Card>
        </div>
      </Container>
    </main>
  );
}
