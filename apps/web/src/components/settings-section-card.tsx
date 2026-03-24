"use client";

import type { ReactNode } from "react";

type SettingsSectionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function SettingsSectionCard({
  eyebrow,
  title,
  description,
  children,
  footer,
  className = "",
}: SettingsSectionCardProps) {
  return (
    <section
      className={[
        "rounded-[32px] border border-[#1e293b]/10 bg-white/88 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.06)] sm:p-8",
        className,
      ].join(" ")}
    >
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#2563eb]/70">
          {eyebrow}
        </p>
        <h2
          className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#0f172a]"
          style={{ fontFamily: "var(--settings-heading-font), Georgia, serif" }}
        >
          {title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-[#475569] sm:text-base">{description}</p>
      </div>

      <div className="mt-6">{children}</div>
      {footer ? <div className="mt-6">{footer}</div> : null}
    </section>
  );
}
