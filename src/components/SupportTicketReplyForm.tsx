"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function SupportTicketReplyForm(props: {
  action: string;
  disabled?: boolean;
  placeholder?: string;
  submitLabel?: string;
}) {
  const router = useRouter();
  const { lang } = useLanguage();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(props.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? t(lang, "support.form.failed"));
      setMessage("");
      setStatus({ ok: true, message: t(lang, "support.form.replySent") });
      router.refresh();
    } catch (err: any) {
      setStatus({ ok: false, message: err?.message ?? t(lang, "support.form.failed") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <textarea
        className="min-h-28 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
        placeholder={props.placeholder ?? t(lang, "support.form.replyPlaceholder")}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        disabled={props.disabled || loading}
        maxLength={4000}
      />

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={props.disabled || loading}>
          {loading ? t(lang, "support.form.sending") : props.submitLabel ?? t(lang, "support.form.reply")}
        </Button>
        {status ? (
          <div className={`text-xs font-semibold ${status.ok ? "text-[color:var(--accent)]" : "text-[color:var(--danger)]"}`}>
            {status.message}
          </div>
        ) : null}
      </div>
    </form>
  );
}