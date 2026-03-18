"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import type { LangCode } from "@/lib/i18n";

type ForumCategoryOption = {
  id: string;
  slug: string;
  name: string;
};

export function ForumThreadComposer(props: {
  lang: LangCode;
  categories: ForumCategoryOption[];
  initialCategorySlug: string | null;
}) {
  const router = useRouter();
  const isEs = props.lang === "es";
  const [categorySlug, setCategorySlug] = useState(props.initialCategorySlug ?? props.categories[0]?.slug ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorySlug, title, body }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? (isEs ? "No se pudo crear el hilo" : "Could not create the thread"));

      router.push(`/community/forum/thread/${json.data.id}`);
      router.refresh();
    } catch (err: any) {
      setStatus({ ok: false, message: err?.message ?? (isEs ? "No se pudo crear el hilo" : "Could not create the thread") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={submit} className="grid gap-4">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{isEs ? "Categoria" : "Category"}</div>
          <select
            className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-2 text-sm text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            required
          >
            {props.categories.map((category) => (
              <option key={category.id} value={category.slug}>{category.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{isEs ? "Titulo" : "Title"}</div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} required placeholder={isEs ? "Ejemplo: Que RAM recomendais para Paper con 20 jugadores?" : "Example: What RAM do you recommend for Paper with 20 players?"} />
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{isEs ? "Contenido" : "Body"}</div>
          <textarea
            className="min-h-40 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-3 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={8000}
            required
            placeholder={isEs ? "Explica el contexto, lo que ya has probado y el tipo de servidor que quieres montar." : "Explain the context, what you have already tried, and the kind of server you want to run."}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading}>{loading ? (isEs ? "Publicando..." : "Publishing...") : (isEs ? "Publicar hilo" : "Publish thread")}</Button>
          <span className="text-xs text-[color:var(--muted)]">{isEs ? "Minimo 20 caracteres en el contenido." : "Minimum 20 characters in the body."}</span>
        </div>

        {status ? <div className={`text-xs font-semibold ${status.ok ? "text-[color:var(--accent)]" : "text-[color:var(--danger)]"}`}>{status.message}</div> : null}
      </form>
    </Card>
  );
}