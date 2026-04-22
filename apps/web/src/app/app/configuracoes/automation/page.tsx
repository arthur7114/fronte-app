import { SettingsAutomationPanel } from "@/components/settings-automation-panel";
import { SettingsShell } from "@/components/settings-shell";
import { loadSettingsWorkspaceData } from "../data";

export default async function AutomationSettingsPage() {
  const data = await loadSettingsWorkspaceData();

  return (
    <SettingsShell
      title="Automacao"
      description="Controle seeds, frequencia, modo operacional e revisao humana dos jobs."
      active="/app/configuracoes/automation"
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
