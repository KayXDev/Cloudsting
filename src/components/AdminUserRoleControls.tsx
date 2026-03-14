"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function AdminUserRoleControls(props: { userId: string; currentRole: "USER" | "ADMIN" }) {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextRole = useMemo(() => (props.currentRole === "ADMIN" ? "USER" : "ADMIN"), [props.currentRole]);

  async function toggle() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/users/${props.userId}` as string, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ role: nextRole }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? t(lang, "common.saveFailed"));

      window.location.reload();
    } catch (e: any) {
      setError(e?.message ?? t(lang, "common.saveFailed"));
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant={props.currentRole === "ADMIN" ? "secondary" : "primary"} onClick={toggle} disabled={loading}>
        {loading ? t(lang, "common.saving") : t(lang, "admin.users.makeRole").replace("{role}", nextRole)}
      </Button>
      {error ? <div className="text-xs font-semibold text-[color:var(--danger)]">{error}</div> : null}
    </div>
  );
}
