import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { StatusBadge } from "@/components/status-badge";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  note: string;
  children: ReactNode;
};

export function AuthPageShell({ eyebrow, title, description, note, children }: AuthPageShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(18,179,166,0.12),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.1),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(244,247,251,0.96))]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:px-8">
          <header className="flex items-center justify-between gap-6">
            <BrandMark subtle />
            <StatusBadge tone="info">{eyebrow}</StatusBadge>
          </header>

          <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                Operacao SaaS
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-[-0.065em] text-foreground sm:text-6xl lg:text-7xl">
                {title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                {description}
              </p>

              <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="dashboard-surface rounded-lg p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Caminho claro
                  </p>
                  <p className="mt-2 leading-7">
                    Um acesso, um contexto e uma proxima acao visivel.
                  </p>
                </div>
                <div className="dashboard-surface rounded-lg p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                    Sem ruido
                  </p>
                  <p className="mt-2 leading-7">
                    O fluxo mostra o que fazer agora e o que vem depois.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {children}
              <div className="dashboard-surface rounded-lg px-4 py-3 text-sm leading-7 text-muted-foreground">
                {note}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
