import Link from "next/link";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { LoginForm } from "@/components/LoginForm";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  const lang = getLanguageFromCookies();

  return (
    <main>
      <Container className="py-16">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "auth.loginTitle")}</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {t(lang, "auth.newHere")} {" "}
            <Link href="/register" className="text-[color:var(--accent)]">{t(lang, "auth.createAccount")}</Link>.
          </p>

          <Card className="mt-8 p-6">
            <LoginForm />
          </Card>
        </div>
      </Container>
    </main>
  );
}
