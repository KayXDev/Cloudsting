"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function AdminServerSuspendControls(props: { serverId: string; status: string }) {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suspended = props.status === "SUSPENDED";

  async function run() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/servers/${props.serverId}/${suspended ? "unsuspend" : "suspend"}`,
        {
          method: "POST",
        }
      );
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? t(lang, "common.actionFailed"));
      window.location.reload();
    } catch (e: any) {
      setError(e?.message ?? t(lang, "common.actionFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant={suspended ? "primary" : "secondary"} disabled={loading} onClick={run}>
        {loading ? t(lang, "common.working") : suspended ? t(lang, "admin.servers.unsuspend") : t(lang, "admin.servers.suspend")}
      </Button>
      {error ? <div className="text-xs font-semibold text-[color:var(--danger)]">{error}</div> : null}
    </div>
  );
}
