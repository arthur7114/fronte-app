import { SettingsShell } from "@/components/settings-shell";
import { SettingsWorkspacePanel } from "@/components/settings-workspace-panel";
import { loadSettingsWorkspaceData } from "../data";

export default async function WorkspaceSettingsPage() {
  const data = await loadSettingsWorkspaceData();

  return (
    <SettingsShell
      active="/app/configuracoes/workspace"
      title="Workspace"
      description="Ajuste a identidade principal do workspace usada em navegacao, rotas e contexto do produto."
      workspaceName={data.tenant.name}
      workspaceSlug={data.tenant.slug}
      site={data.site}
    >
      <SettingsWorkspacePanel tenant={data.tenant} />
    </SettingsShell>
  );
}

