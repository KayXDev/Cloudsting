"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function AdminSyncNodesButton() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sync() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/nodes", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? t(lang, "admin.infra.syncFailed"));
      window.location.reload();
    } catch (e: any) {
      setError(e?.message ?? t(lang, "admin.infra.syncFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="secondary" onClick={sync} disabled={loading}>
        {loading ? t(lang, "common.syncing") : t(lang, "admin.infra.syncNodes")}
      </Button>
      {error ? <div className="mt-2 text-xs font-semibold text-[color:var(--danger)]">{error}</div> : null}
    </div>
  );
}
