"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type StrategyNavProps = {
  strategyId: string;
};

const ITEMS = [
  { href: "overview", label: "Visão Geral" },
  { href: "perfil", label: "Perfil" },
  { href: "keywords", label: "Keywords" },
  { href: "temas", label: "Temas" },
  { href: "artigos", label: "Artigos" },
  { href: "resultados", label: "Resultados" },
];

export function StrategyNav({ strategyId }: StrategyNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 border-b border-black/5 bg-white/50 px-6 backdrop-blur-md">
      {ITEMS.map((item) => {
        const fullHref = `/app/estrategias/${strategyId}/${item.href}`;
        const isActive = pathname === fullHref || (item.href === "overview" && pathname === `/app/estrategias/${strategyId}`);

        return (
          <Link
            key={item.href}
            href={fullHref}
            className={cn(
              "relative px-4 py-4 text-xs font-semibold uppercase tracking-widest transition-all hover:text-primary",
              isActive ? "text-primary" : "text-black/45"
            )}
          >
            {item.label}
            {isActive && (
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function StrategyHeader({ name, strategyId }: { name: string; strategyId: string }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-8 py-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
            Estratégia de Conteúdo
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-black">
            {name}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Actions like Edit Strategy could go here */}
        </div>
      </div>
      <StrategyNav strategyId={strategyId} />
    </div>
  );
}
