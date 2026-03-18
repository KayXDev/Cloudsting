"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function ReviewComposer() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title, body }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? t(lang, "reviews.form.failed"));
      setStatus({ ok: true, message: t(lang, "reviews.form.success") });
      setTitle("");
      setBody("");
      setRating(5);
      router.refresh();
    } catch (err: any) {
      setStatus({ ok: false, message: err?.message ?? t(lang, "reviews.form.failed") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t(lang, "reviews.form.rating")}</div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`rounded-xl border px-3 py-2 text-sm font-bold ${rating === value ? "border-[#1AD76F] bg-[#102116] text-[#1AD76F]" : "border-[color:var(--border)] bg-[color:var(--surface2)] text-[color:var(--text)]"}`}
            >
              {value}★
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t(lang, "reviews.form.reviewTitle")}</div>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder={t(lang, "reviews.form.placeholderTitle")} required />
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t(lang, "reviews.form.body")}</div>
        <textarea
          className="min-h-32 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-3 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          placeholder={t(lang, "reviews.form.placeholderBody")}
          required
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>{loading ? t(lang, "reviews.form.submitting") : t(lang, "reviews.form.submit")}</Button>
        <span className="text-xs text-[color:var(--muted)]">{t(lang, "reviews.form.hint")}</span>
      </div>
      {status ? <div className={`text-xs font-semibold ${status.ok ? "text-[color:var(--accent)]" : "text-[color:var(--danger)]"}`}>{status.message}</div> : null}
    </form>
  );
}