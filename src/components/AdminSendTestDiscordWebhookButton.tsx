"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function AdminSendTestDiscordWebhookButton() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function sendPreview() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/discord/test-purchase", { method: "POST" });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message ?? t(lang, "admin.overview.testDiscordFailed"));
      }

      setSuccess(t(lang, "admin.overview.testDiscordSent"));
    } catch (err: any) {
      setError(err?.message ?? t(lang, "admin.overview.testDiscordFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="secondary" onClick={sendPreview} disabled={loading}>
        {loading ? t(lang, "admin.overview.testDiscordSending") : t(lang, "admin.overview.testDiscord")}
      </Button>
      {success ? <div className="mt-2 text-xs font-semibold text-[color:var(--accent)]">{success}</div> : null}
      {error ? <div className="mt-2 text-xs font-semibold text-[color:var(--danger)]">{error}</div> : null}
    </div>
  );
}