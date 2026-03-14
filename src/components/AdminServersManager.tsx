"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { AdminServerSuspendControls } from "@/components/AdminServerSuspendControls";
import { AdminServerDeleteButton } from "@/components/AdminServerDeleteButton";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

type Row = {
  id: string;
  name: string;
  status: string;
  userEmail: string;
  planSlug: string;
  pterodactylIdentifier: string | null;
  memoryMb: number;
  cpuPercent: number;
  diskMb: number;
};

export function AdminServersManager(props: { rows: Row[]; panelUrl: string }) {
  const { lang } = useLanguage();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  function toggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleAll() {
    if (selectedIds.length === props.rows.length) {
      setSelected({});
      return;
    }
    const next: Record<string, boolean> = {};
    for (const r of props.rows) next[r.id] = true;
    setSelected(next);
  }

  async function runBulk(action: "suspend" | "delete") {
    if (selectedIds.length === 0) return;

    const ok = window.confirm(
      action === "suspend"
        ? t(lang, "admin.servers.confirmSuspend").replace("{count}", String(selectedIds.length))
        : t(lang, "admin.servers.confirmDelete").replace("{count}", String(selectedIds.length))
    );
    if (!ok) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/servers/bulk", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: selectedIds }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok)
        throw new Error(json?.error?.message ?? t(lang, "admin.servers.bulkFailed"));
      window.location.reload();
    } catch (e: any) {
      setError(e?.message ?? t(lang, "admin.servers.bulkFailed"));
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#111111] p-3">
        <Button variant="secondary" onClick={toggleAll}>
          {selectedIds.length === props.rows.length
            ? t(lang, "admin.servers.deselectAll")
            : t(lang, "admin.servers.selectAll")}
        </Button>
        <Button onClick={() => runBulk("suspend")} disabled={loading || selectedIds.length === 0}>
          {loading
            ? t(lang, "common.applying")
            : t(lang, "admin.servers.suspendSelected").replace("{count}", String(selectedIds.length))}
        </Button>
        <Button
          variant="secondary"
          onClick={() => runBulk("delete")}
          disabled={loading || selectedIds.length === 0}
          className="border-[#5d2525] bg-[#2a1414] text-[#ffb5b5] hover:bg-[#341818]"
        >
          {loading
            ? t(lang, "common.applying")
            : t(lang, "admin.servers.deleteSelected").replace("{count}", String(selectedIds.length))}
        </Button>
        {error ? <div className="text-xs font-semibold text-[color:var(--danger)]">{error}</div> : null}
      </div>

      {props.rows.map((s) => (
        <div key={s.id} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(selected[s.id])}
                  onChange={() => toggle(s.id)}
                  className="h-4 w-4 accent-[#1AD76F]"
                />
                <div className="truncate font-semibold text-[color:var(--text)]">{s.name}</div>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${s.status === "ACTIVE" ? "bg-[#1AD76F] text-black" : s.status === "SUSPENDED" ? "bg-[#facc15] text-black" : "bg-[#383838] text-gray-100"}`}>
                  {s.status}
                </span>
              </div>
              <div className="mt-1 text-xs text-[color:var(--muted)]">
                {t(lang, "admin.servers.plan")} {s.planSlug} • {t(lang, "admin.servers.owner")} {s.userEmail}
              </div>
              <div className="mt-1 text-xs text-[color:var(--muted)]">
                {t(lang, "common.resources")
                  .replace("{ram}", String(Math.round(s.memoryMb / 1024)))
                  .replace("{cpu}", String(s.cpuPercent))
                  .replace("{disk}", String(Math.round(s.diskMb / 1024)))}
              </div>
              {props.panelUrl && s.pterodactylIdentifier ? (
                <div className="mt-1 text-xs">
                  <a
                    href={`${props.panelUrl.replace(/\/$/, "")}/server/${s.pterodactylIdentifier}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[color:var(--accent)]"
                  >
                    {t(lang, "admin.servers.openInPanel")}
                  </a>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AdminServerSuspendControls serverId={s.id} status={s.status} />
              <AdminServerDeleteButton serverId={s.id} serverName={s.name} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
