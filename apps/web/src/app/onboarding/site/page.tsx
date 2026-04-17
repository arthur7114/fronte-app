import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { OnboardingSiteForm } from "@/components/onboarding-site-form";
import { PageFrame } from "@/components/page-frame";
import { getAuthContext } from "@/lib/auth-context";
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data";

export default async function OnboardingSitePage() {
  const { user, membership, tenant, site } = await getAuthContext();

  if (!user) {
    redirect("/login");
  }

  if (!membership || !tenant) {
    redirect("/onboarding");
  }

  const briefing = await getBusinessBriefingForTenant(tenant.id);

  if (site) {
    redirect(briefing ? "/dashboard" : "/onboarding/briefing");
  }

  return (
    <PageFrame
      eyebrow="Estrutura do produto"
      title="Conecte o primeiro site."
      description={`O workspace ${tenant.name} ja existe. Agora falta definir a superficie publica que vai sustentar blog, publicacao e operacao editorial.`}
      aside={
        <div className="w-full max-w-sm space-y-4 border border-black/12 bg-[rgba(255,255,255,0.84)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Etapa atual
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-black/65">
            <p>1. Nomeie o site do projeto.</p>
            <p>2. Escolha idioma e subdominio inicial.</p>
            <p>3. Siga para o briefing de negocio.</p>
          </div>
          <LogoutButton />
        </div>
      }
    >
      <OnboardingSiteForm tenantName={tenant.name} />
    </PageFrame>
  );
}
