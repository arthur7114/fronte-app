import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";

type PageFrameProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
};

export function PageFrame({
  eyebrow,
  title,
  description,
  children,
  aside,
}: PageFrameProps) {
  return (
    <main className="min-h-screen bg-[#f3ede3] text-[#121212]">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(182,111,56,0.12),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(18,18,18,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.4),transparent_35%)]" />
        <div className="absolute left-0 top-0 h-px w-full bg-black/10" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8">
          <header className="flex items-center justify-between gap-6">
            <BrandMark />
            <div className="hidden text-xs uppercase tracking-[0.28em] text-black/42 sm:block">
              Painel / Conteudo / Automacao
            </div>
          </header>

          <div className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <section className="max-w-3xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-black/48">
                {eyebrow}
              </p>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl lg:text-8xl">
                {title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-black/68 sm:text-xl">
                {description}
              </p>
            </section>

            <aside className="lg:justify-self-end">{aside}</aside>
          </div>

          <div className="pb-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
