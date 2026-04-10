import Link from "next/link";

type SettingsNavItem = {
  href: string;
  label: string;
  description: string;
  active?: boolean;
};

type SettingsNavProps = {
  items: SettingsNavItem[];
  workspaceName: string;
  workspaceSlug: string;
  siteLabel: string;
};

export function SettingsNav({
  items,
  workspaceName,
  workspaceSlug,
  siteLabel,
}: SettingsNavProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <div className="dashboard-surface rounded-lg p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Contexto
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-foreground">
          {workspaceName}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">slug / {workspaceSlug}</p>

        <div className="mt-4 grid gap-2 rounded-lg border border-border bg-white/85 p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Site</span>
            <span className="font-medium text-foreground">{siteLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Area</span>
            <span className="font-medium text-foreground">Configuracoes</span>
          </div>
        </div>

        <Link
          href="/app/overview"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition duration-200 hover:-translate-y-0.5"
        >
          Voltar ao painel
        </Link>
      </div>

      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={[
              "block rounded-lg border px-4 py-3 transition duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
              item.active
                ? "border-primary bg-primary text-primary-foreground shadow-[0_14px_34px_rgba(18,179,166,0.18)]"
                : "border-border bg-white/88 text-foreground hover:border-primary/20 hover:bg-white",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">{item.label}</span>
              <span className="text-[10px] uppercase tracking-[0.24em] opacity-70">
                {item.active ? "Atual" : "Abrir"}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 opacity-75">{item.description}</p>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
