import { SettingsShell } from "@/components/settings-shell";
import { SettingsWorkspacePanel } from "@/components/settings-workspace-panel";
import { loadSettingsWorkspaceData } from "../data";

export default async function WorkspaceSettingsPage() {
  const data = await loadSettingsWorkspaceData();

  return (
    <SettingsShell
      title="Workspace"
      description="Atualize nome e slug do tenant que organiza sua operacao."
      active="/app/configuracoes/workspace"
      workspaceName={data.tenant.name}
      workspaceSlug={data.tenant.slug}
      site={data.site}
    >
      <SettingsWorkspacePanel tenant={data.tenant} />
    </SettingsShell>
  );
}
