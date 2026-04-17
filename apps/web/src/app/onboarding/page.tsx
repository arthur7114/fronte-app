import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { OnboardingForm } from "@/components/onboarding-form";
import { PageFrame } from "@/components/page-frame";
import { getAuthContext } from "@/lib/auth-context";
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data";

export default async function OnboardingPage() {
  const { user, membership, tenant, site } = await getAuthContext();

  if (!user) {
    redirect("/login");
  }

  if (membership && tenant) {
    const briefing = await getBusinessBriefingForTenant(tenant.id);
    redirect(site ? (briefing ? "/dashboard" : "/onboarding/briefing") : "/onboarding/site");
  }

  return (
    <PageFrame
      eyebrow="Primeiros passos"
      title="Crie o workspace principal."
      description={`Esta etapa cria o contexto base do produto para ${user.email}. Depois disso, voce define o site e completa o briefing do negocio.`}
      aside={
        <div className="w-full max-w-sm space-y-4 border border-black/12 bg-[rgba(255,255,255,0.84)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Fluxo canonico
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-black/65">
            <p>1. Crie o workspace.</p>
            <p>2. Configure o primeiro site.</p>
            <p>3. Explique o negocio antes de entrar no dashboard.</p>
          </div>
          <LogoutButton />
        </div>
      }
    >
      <OnboardingForm />
    </PageFrame>
  );
}
