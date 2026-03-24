import Link from "next/link";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryAction?: ReactNode;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <section className="border border-black/10 bg-white/85 p-6 shadow-[0_20px_60px_rgba(17,17,17,0.06)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
        Sem conteudo
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
        {title}
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-black/62">{description}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex h-11 items-center justify-center border border-black bg-black px-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition duration-200 hover:-translate-y-0.5"
          >
            {actionLabel}
          </Link>
        ) : null}
        {secondaryAction}
      </div>
    </section>
  );
}
