"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import type { LangCode } from "@/lib/i18n";

export function ForumThreadAdminControls(props: {
  threadId: string;
  pinned: boolean;
  locked: boolean;
  lang: LangCode;
}) {
  const router = useRouter();
  const isEs = props.lang === "es";
  const [loading, setLoading] = useState<null | "pin" | "lock">(null);

  async function updateThread(patch: { pinned?: boolean; locked?: boolean }, mode: "pin" | "lock") {
    setLoading(mode);
    try {
      const res = await fetch(`/api/forum/threads/${props.threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? "Request failed");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" disabled={loading !== null} onClick={() => updateThread({ pinned: !props.pinned }, "pin")}>
        {loading === "pin" ? (isEs ? "Guardando..." : "Saving...") : props.pinned ? (isEs ? "Quitar fijado" : "Unpin") : (isEs ? "Fijar hilo" : "Pin thread")}
      </Button>
      <Button variant="secondary" disabled={loading !== null} onClick={() => updateThread({ locked: !props.locked }, "lock")}>
        {loading === "lock" ? (isEs ? "Guardando..." : "Saving...") : props.locked ? (isEs ? "Reabrir hilo" : "Reopen thread") : (isEs ? "Cerrar hilo" : "Lock thread")}
      </Button>
    </div>
  );
}