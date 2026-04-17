import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SettingsAccountPanel } from "@/components/settings-account-panel";
import { SettingsAiPanel } from "@/components/settings-ai-panel";
import { SettingsAutomationPanel } from "@/components/settings-automation-panel";
import { SettingsSitePanel } from "@/components/settings-site-panel";
import { SettingsWorkspacePanel } from "@/components/settings-workspace-panel";
import { loadSettingsWorkspaceData } from "@/app/app/configuracoes/data";

type SettingsSection = "account" | "workspace" | "site" | "automation" | "ai";

const SECTIONS: SettingsSection[] = ["account", "workspace", "site", "automation", "ai"];

type SettingsPageProps = {
  searchParams: Promise<{
    section?: string;
  }>;
};

function isSection(value?: string): value is SettingsSection {
  return SECTIONS.includes((value ?? "") as SettingsSection);
}

function getHref(section: SettingsSection) {
  return `/dashboard/configuracoes?section=${section}`;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const section = isSection(params.section) ? params.section : "account";
  const data = await loadSettingsWorkspaceData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuracoes"
        title="Conta, workspace, site e automacao na mesma pagina."
        description="A experiencia de configuracao foi consolidada para seguir o prototipo visual. As subrotas antigas ficam apenas como compatibilidade e apontam para esta tela."
      />

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((item) => (
          <Link
            key={item}
            href={getHref(item)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              section === item
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {item === "account"
              ? "Conta"
              : item === "workspace"
                ? "Workspace"
                : item === "site"
                  ? "Site"
                  : item === "automation"
                    ? "Automacao"
                    : "IA"}
          </Link>
        ))}
      </div>

      {section === "account" ? (
        <SettingsAccountPanel email={data.user.email ?? ""} profile={data.profile} />
      ) : null}

      {section === "workspace" ? <SettingsWorkspacePanel tenant={data.tenant} /> : null}

      {section === "site" ? (
        <SettingsSitePanel tenantName={data.tenant.name} site={data.site} />
      ) : null}

      {section === "automation" ? (
        <SettingsAutomationPanel
          tenantName={data.tenant.name}
          siteSubdomain={data.site?.subdomain ?? null}
          automationConfig={data.automationConfig}
        />
      ) : null}

      {section === "ai" ? (
        <SettingsAiPanel
          tenantName={data.tenant.name}
          siteSubdomain={data.site?.subdomain ?? null}
          aiPreferences={data.aiPreferences}
          aiRules={data.aiRules}
        />
      ) : null}
    </div>
  );
}
