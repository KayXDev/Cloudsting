"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function RegisterForm() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: name || undefined, email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message ?? t(lang, "auth.registerFailed"));
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? t(lang, "auth.registerFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Input
        placeholder={t(lang, "auth.nameOptional")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
      />
      <Input
        placeholder={t(lang, "auth.email")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        autoComplete="email"
        required
      />
      <Input
        placeholder={t(lang, "auth.passwordMin")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        autoComplete="new-password"
        required
      />

      {error ? <div className="text-xs font-semibold text-[color:var(--danger)]">{error}</div> : null}

      <Button type="submit" disabled={loading}>
        {loading ? t(lang, "auth.creating") : t(lang, "auth.createAccount")}
      </Button>
    </form>
  );
}
