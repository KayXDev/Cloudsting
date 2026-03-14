"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function SupportTicketComposer() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? t(lang, "support.form.failed"));

      setSubject("");
      setMessage("");
      setStatus({ ok: true, message: t(lang, "support.form.ticketCreated") });

      const ticketId = json?.data?.id;
      if (ticketId) {
        router.push(`/support?ticket=${ticketId}`);
      }
      router.refresh();
    } catch (err: any) {
      setStatus({ ok: false, message: err?.message ?? t(lang, "support.form.failed") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <Input
        placeholder={t(lang, "support.form.subject")}
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
        maxLength={120}
      />
      <textarea
        className="min-h-32 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
        placeholder={t(lang, "support.form.message")}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        maxLength={4000}
      />

      <Button type="submit" disabled={loading}>
        {loading ? t(lang, "support.form.sending") : t(lang, "support.form.createTicket")}
      </Button>

      {status ? (
        <div className={`text-xs font-semibold ${status.ok ? "text-[color:var(--accent)]" : "text-[color:var(--danger)]"}`}>
          {status.message}
        </div>
      ) : null}
    </form>
  );
}