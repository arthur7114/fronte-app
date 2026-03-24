import type { ReactNode } from "react";

type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

type StatusBadgeProps = {
  tone?: StatusTone;
  children: ReactNode;
};

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "border-black/10 bg-white/80 text-black/70",
  success: "border-[#2f6b4f]/20 bg-[#edf7ef] text-[#2f6b4f]",
  warning: "border-[#8b5b13]/20 bg-[#fff4df] text-[#8b5b13]",
  danger: "border-[#b3422f]/20 bg-[#fff0ec] text-[#b3422f]",
  info: "border-[#2553eb]/20 bg-[#eef4ff] text-[#2553eb]",
};

export function StatusBadge({ tone = "neutral", children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
