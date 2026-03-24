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
      <div className="rounded-[28px] border border-[#2563eb]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,250,252,0.92))] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#2563eb]/60">
          Contexto
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[#1e293b]">
          {workspaceName}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[#475569]">slug / {workspaceSlug}</p>

        <div className="mt-4 grid gap-2 rounded-3xl border border-[#1e293b]/8 bg-white/85 p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#64748b]">Site</span>
            <span className="font-medium text-[#1e293b]">{siteLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#64748b]">Area</span>
            <span className="font-medium text-[#1e293b]">Configuracoes</span>
          </div>
        </div>

        <Link
          href="/app/overview"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-[#2563eb]/18 bg-[#eff6ff] px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb] transition duration-200 hover:-translate-y-0.5"
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
              "block rounded-[24px] border px-4 py-3 transition duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
              item.active
                ? "border-[#1d4ed8] bg-[#1d4ed8] text-white shadow-[0_14px_34px_rgba(29,78,216,0.18)]"
                : "border-[#1e293b]/10 bg-white/88 text-[#1e293b] hover:border-[#2563eb]/20 hover:bg-white",
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
