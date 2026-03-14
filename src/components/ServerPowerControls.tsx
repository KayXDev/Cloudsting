"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

export function ServerPowerControls(props: { serverId: string }) {
  const [loading, setLoading] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);

  async function action(a: "start" | "stop" | "restart" | "kill") {
    setLoading(a);
    setError(null);

    try {
      const res = await fetch(`/api/servers/${props.serverId}/power`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: a }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? "Action failed");
    } catch (e: any) {
      setError(e?.message ?? "Action failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-2 gap-2">
        <Button variant="primary" disabled={loading !== null} onClick={() => action("start")}>
          {loading === "start" ? "Starting…" : "Start"}
        </Button>
        <Button variant="secondary" disabled={loading !== null} onClick={() => action("restart")}>
          {loading === "restart" ? "Restarting…" : "Restart"}
        </Button>
        <Button variant="secondary" disabled={loading !== null} onClick={() => action("stop")}>
          {loading === "stop" ? "Stopping…" : "Stop"}
        </Button>
        <Button variant="secondary" disabled={loading !== null} onClick={() => action("kill")}>
          {loading === "kill" ? "Killing…" : "Kill"}
        </Button>
      </div>
      {error ? <div className="text-xs font-semibold text-[color:var(--danger)]">{error}</div> : null}
    </div>
  );
}
