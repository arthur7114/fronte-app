import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { OnboardingBriefingForm } from "@/components/onboarding-briefing-form";
import { PageFrame } from "@/components/page-frame";
import { getAuthContext } from "@/lib/auth-context";
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data";

export default async function OnboardingBriefingPage() {
  const { user, membership, tenant, site } = await getAuthContext();

  if (!user) {
    redirect("/login");
  }

  if (!membership || !tenant) {
    redirect("/onboarding");
  }

  if (!site) {
    redirect("/onboarding/site");
  }

  const briefing = await getBusinessBriefingForTenant(tenant.id);

  if (briefing) {
    redirect("/dashboard");
  }

  return (
    <PageFrame
      eyebrow="Contexto de negocio"
      title="Alimente a estrategia."
      description={`Com ${tenant.name} e ${site.name} prontos, falta apenas o briefing que vai orientar keywords, temas, artigos e a hierarquia do dashboard.`}
      aside={
        <div className="w-full max-w-sm space-y-4 border border-black/12 bg-[rgba(255,255,255,0.84)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Antes de entrar
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-black/65">
            <p>1. Explique oferta e publico.</p>
            <p>2. Liste sinais de mercado relevantes.</p>
            <p>3. Entre no dashboard com a base estrategica correta.</p>
          </div>
          <LogoutButton />
        </div>
      }
    >
      <OnboardingBriefingForm tenantName={tenant.name} siteName={site.name} />
    </PageFrame>
  );
}
