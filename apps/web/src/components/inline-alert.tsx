import type { ReactNode } from "react";

type InlineAlertProps = {
  tone?: "success" | "warning" | "danger" | "info";
  children: ReactNode;
};

const TONE_CLASSES: Record<NonNullable<InlineAlertProps["tone"]>, string> = {
  success: "border-[#2f6b4f]/20 bg-[#edf7ef] text-[#2f6b4f]",
  warning: "border-[#8b5b13]/20 bg-[#fff4df] text-[#8b5b13]",
  danger: "border-[#b3422f]/20 bg-[#fff0ec] text-[#b3422f]",
  info: "border-[#2553eb]/20 bg-[#eef4ff] text-[#2553eb]",
};

export function InlineAlert({ tone = "info", children }: InlineAlertProps) {
  return (
    <p className={`border px-4 py-3 text-sm ${TONE_CLASSES[tone]}`}>
      {children}
    </p>
  );
}
