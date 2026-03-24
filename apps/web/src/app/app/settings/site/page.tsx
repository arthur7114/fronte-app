import { SettingsShell } from "@/components/settings-shell";
import { SettingsSitePanel } from "@/components/settings-site-panel";
import { loadSettingsWorkspaceData } from "../data";

export default async function SiteSettingsPage() {
  const data = await loadSettingsWorkspaceData();

  return (
    <SettingsShell
      active="/app/settings/site"
      title="Site"
      description="Edite nome, idioma e subdominio do site sem sair da operacao do app."
      workspaceName={data.tenant.name}
      workspaceSlug={data.tenant.slug}
      site={data.site}
    >
      <SettingsSitePanel tenantName={data.tenant.name} site={data.site} />
    </SettingsShell>
  );
}
