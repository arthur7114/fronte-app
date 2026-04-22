import { SettingsAccountPanel } from "@/components/settings-account-panel";
import { SettingsShell } from "@/components/settings-shell";
import { loadSettingsWorkspaceData } from "../data";

export default async function AccountSettingsPage() {
  const data = await loadSettingsWorkspaceData();

  return (
    <SettingsShell
      title="Conta"
      description="Gerencie o acesso e a identidade exibida dentro do app."
      active="/app/configuracoes/account"
      workspaceName={data.tenant.name}
      workspaceSlug={data.tenant.slug}
      site={data.site}
    >
      <SettingsAccountPanel email={data.user.email ?? ""} profile={data.profile} />
    </SettingsShell>
  );
}
