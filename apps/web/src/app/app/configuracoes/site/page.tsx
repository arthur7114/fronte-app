import { SettingsShell } from "@/components/settings-shell";
import { SettingsSitePanel } from "@/components/settings-site-panel";
import { loadSettingsWorkspaceData } from "../data";

export default async function SiteSettingsPage() {
  const data = await loadSettingsWorkspaceData();

  return (
    <SettingsShell
      title="Site"
      description="Configure o blog publico, idioma e subdominio."
      active="/app/configuracoes/site"
      workspaceName={data.tenant.name}
      workspaceSlug={data.tenant.slug}
      site={data.site}
    >
      <SettingsSitePanel tenantName={data.tenant.name} site={data.site} />
    </SettingsShell>
  );
}
