"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { Input } from "@/components/Input";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function LoginForm() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message ?? t(lang, "auth.loginFailed"));
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? t(lang, "auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5">
      <form onSubmit={onSubmit} className="grid gap-3">
        <Input
          placeholder={t(lang, "auth.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          required
        />
        <Input
          placeholder={t(lang, "auth.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          required
        />

        {error ? <div className="text-xs font-semibold text-[color:var(--danger)]">{error}</div> : null}

        <Button type="submit" disabled={loading}>
          {loading ? t(lang, "auth.signingIn") : t(lang, "auth.login")}
        </Button>
      </form>

      <GoogleAuthButton mode="login" />
    </div>
  );
}
