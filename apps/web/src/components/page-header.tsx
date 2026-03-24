import type { ReactNode } from "react";
import { StatusBadge } from "@/components/status-badge";

type PageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  badge?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <header className="border border-black/10 bg-white/85 p-6 shadow-[0_24px_70px_rgba(17,17,17,0.06)] sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">
              {eyebrow}
            </p>
            {badge ? <StatusBadge>{badge}</StatusBadge> : null}
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-black sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-black/64 sm:text-lg">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
