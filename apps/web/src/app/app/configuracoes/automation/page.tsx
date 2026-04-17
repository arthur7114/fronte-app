import { SettingsAutomationPanel } from "@/components/settings-automation-panel";
import { SettingsShell } from "@/components/settings-shell";
import { loadSettingsWorkspaceData } from "../data";

export default async function AutomationSettingsPage() {
  const data = await loadSettingsWorkspaceData();

  return (
    <SettingsShell
      active="/app/configuracoes/automation"
      title="Automacao"
      description="Ajuste idioma, frequencia e curadoria obrigatoria para o pipeline de conteudo."
      workspaceName={data.tenant.name}
      workspaceSlug={data.tenant.slug}
      site={data.site}
    >
      <SettingsAutomationPanel
        tenantName={data.tenant.name}
        siteSubdomain={data.site?.subdomain ?? null}
        automationConfig={data.automationConfig}
      />
    </SettingsShell>
  );
}

