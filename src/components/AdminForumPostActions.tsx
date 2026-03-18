"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function AdminForumPostActions(props: {
  postId: string;
  threadId: string;
  initialBody: string;
  deletesThread: boolean;
}) {
  const router = useRouter();
  const { lang } = useLanguage();
  const [body, setBody] = useState(props.initialBody);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/forum/posts/${props.postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? t(lang, "common.saveFailed"));
      setStatus({ ok: true, message: t(lang, "common.saved") });
      router.refresh();
    } catch (err: any) {
      setStatus({ ok: false, message: err?.message ?? t(lang, "common.saveFailed") });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const confirmLabel = props.deletesThread ? t(lang, "admin.forum.deleteThread") : t(lang, "common.delete");
    if (!window.confirm(confirmLabel)) return;

    setDeleting(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/forum/posts/${props.postId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? t(lang, "common.deleteFailed"));

      if (json?.data?.deletedThread) {
        router.push("/admin/forum");
      }
      router.refresh();
    } catch (err: any) {
      setStatus({ ok: false, message: err?.message ?? t(lang, "common.deleteFailed") });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface1)] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t(lang, "admin.forum.editBody")}</div>
      <textarea
        className="mt-3 min-h-28 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-3 text-sm text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={8000}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" disabled={saving || deleting} onClick={save}>
          {saving ? t(lang, "common.saving") : t(lang, "common.save")}
        </Button>
        <Button type="button" variant="secondary" className="border-[#5d2525] bg-[#2a1414] text-[#ffb5b5] hover:bg-[#341818]" disabled={saving || deleting} onClick={remove}>
          {deleting ? t(lang, "common.deleting") : props.deletesThread ? t(lang, "admin.forum.deleteThread") : t(lang, "common.delete")}
        </Button>
        {status ? <div className={`text-xs font-semibold ${status.ok ? "text-[color:var(--accent)]" : "text-[color:var(--danger)]"}`}>{status.message}</div> : null}
      </div>
    </div>
  );
}