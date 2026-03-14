"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function ProfileSettingsForm(props: { initialName: string; initialEmail: string }) {
  const { lang } = useLanguage();
  const [name, setName] = useState(props.initialName);
  const [email, setEmail] = useState(props.initialEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(null);

    try {
      const body: Record<string, string> = {};

      if (name.trim() !== props.initialName) body.name = name.trim();
      if (email.trim() !== props.initialEmail) body.email = email.trim();
      if (newPassword.trim()) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      if (Object.keys(body).length === 0) {
        setSaved(t(lang, "profile.form.noChanges"));
        setLoading(false);
        return;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message ?? t(lang, "profile.form.updateFailed"));
      }

      setSaved(t(lang, "profile.form.updated"));
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err?.message ?? t(lang, "profile.form.updateFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSave} className="grid gap-4">
      <div className="grid gap-1">
        <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "profile.form.displayName")}</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t(lang, "profile.form.namePlaceholder")} />
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "profile.form.email")}</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t(lang, "profile.form.emailPlaceholder")} />
      </div>

      <div className="grid gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface1)] p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "profile.form.changePassword")}</div>
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder={t(lang, "profile.form.currentPassword")}
        />
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={t(lang, "profile.form.newPassword")}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? t(lang, "common.saving") : t(lang, "profile.form.saveChanges")}
        </Button>
        {saved ? <div className="text-xs font-semibold text-[color:var(--accent)]">{saved}</div> : null}
        {error ? <div className="text-xs font-semibold text-[color:var(--danger)]">{error}</div> : null}
      </div>
    </form>
  );
}
