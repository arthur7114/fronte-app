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
        "dashboard-surface rounded-lg p-6 sm:p-8",
        className,
      ].join(" ")}
    >
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
          {title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>

      <div className="mt-6">{children}</div>
      {footer ? <div className="mt-6">{footer}</div> : null}
    </section>
  );
}
