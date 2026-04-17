import type { ReactNode } from "react";
import type { Tables } from "@super/db";
import { SettingsNav } from "@/components/settings-nav";
import { SettingsPageHeader } from "@/components/settings-page-header";

type SettingsShellProps = {
  title: string;
  description: string;
  active: string;
  workspaceName: string;
  workspaceSlug: string;
  site: Tables<"sites"> | null;
  children: ReactNode;
};

const SETTINGS_ITEMS = [
  { href: "/app/configuracoes/account", label: "Conta", description: "Nome e acesso" },
  { href: "/app/configuracoes/workspace", label: "Workspace", description: "Identidade do tenant" },
  { href: "/app/configuracoes/site", label: "Site", description: "Blog e subdominio" },
  { href: "/app/configuracoes/ai", label: "IA", description: "Tom e estilo" },
  { href: "/app/configuracoes/automation", label: "Automacao", description: "Seeds e frequencia" },
];

export function SettingsShell({
  title,
  description,
  active,
  workspaceName,
  workspaceSlug,
  site,
  children,
}: SettingsShellProps) {
  const items = SETTINGS_ITEMS.map((item) => ({
    ...item,
    active: item.href === active,
  }));

  return (
    <section className="grid gap-6 xl:grid-cols-[18.5rem_minmax(0,1fr)]">
      <SettingsNav
        items={items}
        workspaceName={workspaceName}
        workspaceSlug={workspaceSlug}
        siteLabel={site ? `${site.subdomain} / ${site.language}` : "Sem site"}
      />
      <div className="space-y-6">
        <SettingsPageHeader
          title={title}
          description={description}
          workspaceName={workspaceName}
          workspaceSlug={workspaceSlug}
          site={site}
        />
        {children}
      </div>
    </section>
  );
}

