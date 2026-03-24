import { SettingsAccountPanel } from "@/components/settings-account-panel";
import { SettingsShell } from "@/components/settings-shell";
import { loadSettingsWorkspaceData } from "../data";

export default async function AccountSettingsPage() {
  const data = await loadSettingsWorkspaceData();

  return (
    <SettingsShell
      active="/app/settings/account"
      title="Conta"
      description="Gerencie os dados basicos da conta usada para acessar o workspace."
      workspaceName={data.tenant.name}
      workspaceSlug={data.tenant.slug}
      site={data.site}
    >
      <SettingsAccountPanel email={data.user.email ?? "Nao informado"} profile={data.profile} />
    </SettingsShell>
  );
}
