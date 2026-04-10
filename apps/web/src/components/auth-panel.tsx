import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/status-badge";

type AuthPanelProps = {
  mode: "login" | "signup";
  children: ReactNode;
};

export function AuthPanel({ mode, children }: AuthPanelProps) {
  const isSignup = mode === "signup";

  return (
    <section className="dashboard-surface w-full rounded-lg p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {isSignup ? "Criar acesso" : "Entrar"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">
            {isSignup ? "Abra seu primeiro espaco de trabalho" : "Continue de onde parou"}
          </h2>
        </div>
        <StatusBadge tone="info">Email + senha</StatusBadge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>{children}</div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-secondary/35 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Intencao do bloco
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              A experiencia de acesso evita ruido: entrar, criar o contexto e seguir para
              a operacao sem telas intermediarias desnecessarias.
            </p>
          </div>

          <div className="text-sm">
            <Link
              href="/"
              className="underline decoration-primary/30 underline-offset-4 hover:text-primary"
            >
              Ver pagina inicial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
