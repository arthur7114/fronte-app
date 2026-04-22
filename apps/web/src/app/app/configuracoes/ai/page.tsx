import { SettingsAiPanel } from "@/components/settings-ai-panel";
import { SettingsShell } from "@/components/settings-shell";
import { loadSettingsWorkspaceData } from "../data";

export default async function AiSettingsPage() {
  const data = await loadSettingsWorkspaceData();

  return (
    <SettingsShell
      title="IA"
      description="Defina modelo, tom editorial e regras que guiam a geracao."
      active="/app/configuracoes/ai"
      workspaceName={data.tenant.name}
      workspaceSlug={data.tenant.slug}
      site={data.site}
    >
      <SettingsAiPanel
        tenantName={data.tenant.name}
        siteSubdomain={data.site?.subdomain ?? null}
        aiPreferences={data.aiPreferences}
        aiRules={data.aiRules}
      />
    </SettingsShell>
  );
}
