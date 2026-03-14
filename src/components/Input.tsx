import type { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      className={`w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
        className ?? ""
      }`}
      {...rest}
    />
  );
}
