"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function AdminPlanPriceEditor(props: {
  slug: string;
  name: string;
  currentPriceMonthlyCents: number;
  ramMb: number;
  cpuPercent: number;
  diskMb: number;
  databasesLimit: number;
  backupsLimit: number;
  allocationsLimit: number;
  active: boolean;
}) {
  const { lang } = useLanguage();
  const initialDollars = useMemo(
    () => (props.currentPriceMonthlyCents / 100).toFixed(2),
    [props.currentPriceMonthlyCents]
  );

  const initialRamGb = useMemo(() => (props.ramMb / 1024).toString(), [props.ramMb]);
  const initialCpu = useMemo(() => String(props.cpuPercent), [props.cpuPercent]);
  const initialDiskGb = useMemo(() => String(Math.round(props.diskMb / 1024)), [props.diskMb]);
  const initialDatabases = useMemo(() => String(props.databasesLimit ?? 0), [props.databasesLimit]);
  const initialBackups = useMemo(() => String(props.backupsLimit ?? 0), [props.backupsLimit]);
  const initialAllocations = useMemo(() => String(props.allocationsLimit ?? 1), [props.allocationsLimit]);

  const [value, setValue] = useState(initialDollars);
  const [ramGb, setRamGb] = useState(initialRamGb);
  const [cpuPercent, setCpuPercent] = useState(initialCpu);
  const [diskGb, setDiskGb] = useState(initialDiskGb);
  const [databasesLimit, setDatabasesLimit] = useState(initialDatabases);
  const [backupsLimit, setBackupsLimit] = useState(initialBackups);
  const [allocationsLimit, setAllocationsLimit] = useState(initialAllocations);
  const [active, setActive] = useState(Boolean(props.active));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const parsed = Number.parseFloat(value);
      if (!Number.isFinite(parsed) || parsed < 0) throw new Error(t(lang, "admin.plans.invalidPrice"));

      const cents = Math.round(parsed * 100);

      const parsedRamGb = Number.parseFloat(ramGb);
      if (!Number.isFinite(parsedRamGb) || parsedRamGb <= 0) throw new Error(t(lang, "admin.plans.invalidRam"));
      const ramMb = Math.round(parsedRamGb * 1024);

      const parsedCpu = Number.parseInt(cpuPercent, 10);
      if (!Number.isFinite(parsedCpu) || parsedCpu <= 0) throw new Error(t(lang, "admin.plans.invalidCpu"));

      const parsedDiskGb = Number.parseInt(diskGb, 10);
      if (!Number.isFinite(parsedDiskGb) || parsedDiskGb <= 0) throw new Error(t(lang, "admin.plans.invalidDisk"));
      const diskMb = parsedDiskGb * 1024;

      const parsedDatabases = Number.parseInt(databasesLimit, 10);
      if (!Number.isFinite(parsedDatabases) || parsedDatabases < 0)
        throw new Error(t(lang, "admin.plans.invalidDatabases"));

      const parsedBackups = Number.parseInt(backupsLimit, 10);
      if (!Number.isFinite(parsedBackups) || parsedBackups < 0)
        throw new Error(t(lang, "admin.plans.invalidBackups"));

      const parsedAllocations = Number.parseInt(allocationsLimit, 10);
      if (!Number.isFinite(parsedAllocations) || parsedAllocations < 1)
        throw new Error(t(lang, "admin.plans.invalidAllocations"));

      const res = await fetch(`/api/admin/plans/${props.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          priceMonthlyCents: cents,
          ramMb,
          cpuPercent: parsedCpu,
          diskMb,
          databasesLimit: parsedDatabases,
          backupsLimit: parsedBackups,
          allocationsLimit: parsedAllocations,
          active,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? t(lang, "common.saveFailed"));

      setSaved(true);
      window.location.reload();
    } catch (e: any) {
      setError(e?.message ?? t(lang, "common.saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "admin.plans.active")}</div>
          <label className="flex items-center gap-2 text-xs font-semibold text-[color:var(--text)]">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 accent-[color:var(--accent)]"
            />
            {active ? t(lang, "common.enabled") : t(lang, "common.disabled")}
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "admin.plans.pricePerMonth")}</div>
            <div className="mt-1">
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                inputMode="decimal"
                placeholder={initialDollars}
              />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "admin.plans.ramGb")}</div>
            <div className="mt-1">
              <Input value={ramGb} onChange={(e) => setRamGb(e.target.value)} inputMode="decimal" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "admin.plans.cpuPercent")}</div>
            <div className="mt-1">
              <Input value={cpuPercent} onChange={(e) => setCpuPercent(e.target.value)} inputMode="numeric" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "admin.plans.diskGb")}</div>
            <div className="mt-1">
              <Input value={diskGb} onChange={(e) => setDiskGb(e.target.value)} inputMode="numeric" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "admin.plans.databases")}</div>
            <div className="mt-1">
              <Input value={databasesLimit} onChange={(e) => setDatabasesLimit(e.target.value)} inputMode="numeric" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "admin.plans.backups")}</div>
            <div className="mt-1">
              <Input value={backupsLimit} onChange={(e) => setBackupsLimit(e.target.value)} inputMode="numeric" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[color:var(--muted)]">{t(lang, "admin.plans.allocations")}</div>
            <div className="mt-1">
              <Input value={allocationsLimit} onChange={(e) => setAllocationsLimit(e.target.value)} inputMode="numeric" />
            </div>
          </div>

          <div className="flex items-end">
            <Button onClick={save} disabled={loading} className="w-full">
              {loading ? t(lang, "common.saving") : t(lang, "common.save")}
            </Button>
          </div>
        </div>
      </div>

      {error ? <div className="text-xs font-semibold text-[color:var(--danger)]">{error}</div> : null}
      {saved ? <div className="text-xs font-semibold text-[color:var(--accent)]">{t(lang, "common.saved")}</div> : null}
    </div>
  );
}
