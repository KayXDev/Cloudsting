"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

export function AdminTicketStatusControls(props: {
  ticketId: string;
  status: "OPEN" | "STAFF_REPLIED" | "CUSTOMER_REPLIED" | "CLOSED";
  reopenLabel: string;
  closeLabel: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(nextStatus: "OPEN" | "CLOSED") {
    setLoading(true);
    try {
      await fetch(`/api/admin/tickets/${props.ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return props.status === "CLOSED" ? (
    <Button type="button" disabled={loading} onClick={() => updateStatus("OPEN")}>
      {props.reopenLabel}
    </Button>
  ) : (
    <Button type="button" disabled={loading} onClick={() => updateStatus("CLOSED")}>
      {props.closeLabel}
    </Button>
  );
}