import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }
) {
  const variant = props.variant ?? "primary";

  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] disabled:opacity-50";

  const styles: Record<Variant, string> = {
    primary:
      "bg-[color:var(--accent)] text-[color:var(--bg)] hover:brightness-110",
    secondary:
      "bg-[color:var(--surface2)] text-[color:var(--text)] border border-[color:var(--border)] hover:bg-[color:var(--surface3)]",
    ghost: "bg-transparent text-[color:var(--text)] hover:bg-[color:var(--surface2)]",
  };

  const { className, variant: _v, ...rest } = props;

  return (
    <button className={`${base} ${styles[variant]} ${className ?? ""}`} {...rest} />
  );
}
