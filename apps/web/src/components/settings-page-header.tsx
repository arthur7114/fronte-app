import Link from "next/link";
import type { Tables } from "@super/db";

type SettingsPageHeaderProps = {
  title: string;
  description: string;
  workspaceName: string;
  workspaceSlug: string;
  site: Tables<"sites"> | null;
};

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-[#1e293b]/10 bg-white/82 px-3 py-2 text-xs text-[#475569]">
      <span className="font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
        {label}
      </span>
      <span className="ml-2 font-medium text-[#1e293b]">{value}</span>
    </div>
  );
}

export function SettingsPageHeader({
  title,
  description,
  workspaceName,
  workspaceSlug,
  site,
}: SettingsPageHeaderProps) {
  return (
    <header className="overflow-hidden rounded-[32px] border border-[#1e293b]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.9))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#2563eb]/70">
            Configuracoes
          </p>
          <h1
            className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-[#0f172a] sm:text-5xl"
            style={{ fontFamily: "var(--settings-heading-font), Georgia, serif" }}
          >
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#475569] sm:text-lg">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/app/overview"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#2563eb]/18 bg-[#eff6ff] px-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#2563eb] transition duration-200 hover:-translate-y-0.5"
          >
            Voltar ao painel
          </Link>
          {site ? (
            <Link
              href={`/blog/${site.subdomain}`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#f97316]/25 bg-[#fff7ed] px-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#c2410c] transition duration-200 hover:-translate-y-0.5"
            >
              Abrir blog
            </Link>
          ) : (
            <Link
              href="/app/settings/site"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#f97316]/25 bg-[#fff7ed] px-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#c2410c] transition duration-200 hover:-translate-y-0.5"
            >
              Criar site
            </Link>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Chip label="Workspace" value={workspaceName} />
        <Chip label="Slug" value={workspaceSlug} />
        <Chip label="Site" value={site ? site.subdomain : "Sem site"} />
        <Chip label="Idioma" value={site?.language ?? "pt-BR"} />
      </div>
    </header>
  );
}
