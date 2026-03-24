import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";

type BlogFrameProps = {
  subdomain: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
};

export function BlogFrame({
  subdomain,
  title,
  description,
  children,
  aside,
}: BlogFrameProps) {
  return (
    <main className="min-h-screen bg-[#f3ede3] text-[#121212]">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(182,111,56,0.12),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(18,18,18,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.4),transparent_35%)]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8">
          <header className="flex items-center justify-between gap-6">
            <BrandMark subtle />
            <div className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-black/45">
              Blog / {subdomain}
            </div>
          </header>

          <div className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
            <section className="max-w-3xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-black/48">
                Publicacao
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
