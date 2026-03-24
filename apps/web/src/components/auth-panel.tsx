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
    <section className="w-full border border-black/10 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4 border-b border-black/8 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2563eb]">
            {isSignup ? "Criar acesso" : "Entrar"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#1e293b]">
            {isSignup ? "Abra seu primeiro espaco de trabalho" : "Continue de onde parou"}
          </h2>
        </div>
        <StatusBadge tone="info">Email + senha</StatusBadge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>{children}</div>

        <div className="space-y-4">
          <div className="border border-black/10 bg-[#f8fafc] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2563eb]">
              Intencao do bloco
            </p>
            <p className="mt-3 text-sm leading-7 text-[#475569]">
              A experiencia de acesso evita ruido: entrar, criar o contexto e seguir para
              a operacao sem telas intermediarias desnecessarias.
            </p>
          </div>

          <div className="text-sm">
            <Link
              href="/"
              className="underline decoration-[#2563eb]/30 underline-offset-4 hover:text-[#2563eb]"
            >
              Ver pagina inicial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
