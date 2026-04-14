import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { OnboardingForm } from "@/components/onboarding-form";
import { ConversationalOnboarding } from "@/components/conversational-onboarding";
import { PageFrame } from "@/components/page-frame";
import { getAuthContext } from "@/lib/auth-context";

export default async function OnboardingPage() {
  const { user, membership, site } = await getAuthContext();

  if (!user) {
    redirect("/auth/login");
  }

  if (membership) {
    redirect(site ? "/app/overview" : "/onboarding/site");
  }

  return (
    <PageFrame
      eyebrow="Primeiros passos"
      title="Defina seu primeiro espaco de trabalho."
      description={`Esta etapa cria o contexto principal do produto. Voce entrou como ${user.email}. Depois disso, falta conectar o primeiro site antes de entrar na operacao.`}
      aside={
        <div className="w-full max-w-sm space-y-4 border border-black/12 bg-[rgba(255,255,255,0.84)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Checklist
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-black/65">
            <p>1. De um nome claro para o espaco de trabalho.</p>
            <p>2. Escolha um slug que possa evoluir para outras rotas depois.</p>
            <p>3. Siga para a criacao do site logo em seguida.</p>
          </div>
          <LogoutButton />
        </div>
      }
    >
      <ConversationalOnboarding />
    </PageFrame>
  );
}
