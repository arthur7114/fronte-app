import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SettingsSitePanel } from "@/components/settings-site-panel";
import { getAuthContext } from "@/lib/auth-context";

export default async function AppEntryPage() {
  const { user, membership, tenant, site } = await getAuthContext();

  if (!user) {
    redirect("/login");
  }

  if (!membership || !tenant) {
    redirect("/onboarding");
  }

  if (site) {
    redirect("/app/dashboard");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Setup do site"
        title="Seu workspace esta pronto. Agora conecte o primeiro site."
        description="O acesso e o workspace ja estao resolvidos. Falta criar a base publica do blog para liberar dashboard, artigos e operacao editorial."
        badge={<span>Site pendente</span>}
        actions={
          <Link
            href="/app/configuracoes/site"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white/85 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition duration-200 hover:-translate-y-0.5"
          >
            Abrir em configuracoes
          </Link>
        }
      />

      <EmptyState
        title="Crie o primeiro site para continuar."
        description="Assim que nome, idioma e subdominio forem definidos, o app libera o restante da operacao e o proximo acesso ja cai direto no dashboard."
        actionLabel="Abrir configuracoes do site"
        actionHref="/app/configuracoes/site"
      />

      <SettingsSitePanel tenantName={tenant.name} site={null} />
    </div>
  );
}
