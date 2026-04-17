import { SettingsAiPanel } from "@/components/settings-ai-panel";
import { SettingsShell } from "@/components/settings-shell";
import { loadSettingsWorkspaceData } from "../data";

export default async function AiSettingsPage() {
  const data = await loadSettingsWorkspaceData();

  return (
    <SettingsShell
      active="/app/configuracoes/ai"
      title="IA"
      description="Defina o modelo, o tom e as regras guiadas da IA sem expor credenciais por tenant neste MVP."
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

