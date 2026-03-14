"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function AdminServerDeleteButton(props: { serverId: string; serverName: string }) {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    const ok = window.confirm(
      t(lang, "admin.servers.confirmDeleteSingle")
        .replace("{name}", props.serverName)
    );
    if (!ok) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/servers/${props.serverId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? t(lang, "common.deleteFailed"));
      window.location.reload();
    } catch (e: any) {
      setError(e?.message ?? t(lang, "common.deleteFailed"));
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" onClick={run} disabled={loading} className="border-[#5d2525] bg-[#2a1414] text-[#ffb5b5] hover:bg-[#341818]">
        {loading ? t(lang, "common.deleting") : t(lang, "common.delete")}
      </Button>
      {error ? <div className="text-xs font-semibold text-[color:var(--danger)]">{error}</div> : null}
    </div>
  );
}
