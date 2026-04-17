import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { SiteSetupPanel } from "@/components/site-setup-panel";
import { PageFrame } from "@/components/page-frame";
import { getAuthContext } from "@/lib/auth-context";

export default async function OnboardingSitePage() {
  const { user, membership, tenant, site } = await getAuthContext();

  if (!user) {
    redirect("/auth/login");
  }

  if (!membership || !tenant) {
    redirect("/onboarding");
  }

  if (site) {
    redirect("/app/dashboard");
  }

  return (
    <PageFrame
      eyebrow="Ultimo passo"
      title="Conecte o primeiro site ao workspace."
      description={`Seu workspace ${tenant.name} ja existe. Agora falta criar o site que vai sustentar posts, automacao e publicacao.`}
      aside={
        <div className="w-full max-w-sm space-y-4 border border-black/12 bg-[rgba(255,255,255,0.84)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            O que falta
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-black/65">
            <p>1. Nome do site.</p>
            <p>2. Idioma padrao.</p>
            <p>3. Subdominio publico inicial.</p>
          </div>
          <LogoutButton />
        </div>
      }
    >
      <SiteSetupPanel tenantName={tenant.name} site={null} flow="onboarding" />
    </PageFrame>
  );
}

