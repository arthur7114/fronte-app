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
    <div className="rounded-full border border-border bg-white/82 px-3 py-2 text-xs text-muted-foreground">
      <span className="font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
        {label}
      </span>
      <span className="ml-2 font-medium text-foreground">{value}</span>
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
    <header className="dashboard-surface overflow-hidden rounded-lg p-6 sm:p-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            Configuracoes
          </p>
          <h1
            className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl"
          >
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/app/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white px-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition duration-200 hover:-translate-y-0.5"
          >
            Voltar ao painel
          </Link>
          {site ? (
            <Link
              href={`/blog/${site.subdomain}`}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-accent transition duration-200 hover:-translate-y-0.5"
            >
              Abrir blog
            </Link>
          ) : (
            <Link
              href="/app/configuracoes/site"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-accent transition duration-200 hover:-translate-y-0.5"
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

