import type { ReactNode } from "react";

type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

type StatusBadgeProps = {
  tone?: StatusTone;
  children: ReactNode;
};

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "border-border bg-secondary/55 text-foreground/75",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
  danger: "border-danger/20 bg-danger/10 text-danger",
  info: "border-primary/20 bg-primary/10 text-primary",
};

export function StatusBadge({ tone = "neutral", children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
