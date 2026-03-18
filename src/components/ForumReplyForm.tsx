"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import type { LangCode } from "@/lib/i18n";

export function ForumReplyForm(props: { threadId: string; lang: LangCode }) {
  const router = useRouter();
  const isEs = props.lang === "es";
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/forum/threads/${props.threadId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? (isEs ? "No se pudo publicar la respuesta" : "Could not publish the reply"));

      setBody("");
      router.refresh();
    } catch (err: any) {
      setStatus({ ok: false, message: err?.message ?? (isEs ? "No se pudo publicar la respuesta" : "Could not publish the reply") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <textarea
        className="min-h-32 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-3 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        maxLength={8000}
        placeholder={isEs ? "Responde con contexto y evita mensajes de una sola linea sin informacion util." : "Reply with context and avoid one-line answers that add no useful information."}
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>{loading ? (isEs ? "Enviando..." : "Sending...") : (isEs ? "Publicar respuesta" : "Post reply")}</Button>
        <span className="text-xs text-[color:var(--muted)]">{isEs ? "Minimo 6 caracteres." : "Minimum 6 characters."}</span>
      </div>
      {status ? <div className={`text-xs font-semibold ${status.ok ? "text-[color:var(--accent)]" : "text-[color:var(--danger)]"}`}>{status.message}</div> : null}
    </form>
  );
}