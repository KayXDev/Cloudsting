import type { ReactNode } from "react";

export function Card(props: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[color:var(--border)] bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </div>
  );
}
