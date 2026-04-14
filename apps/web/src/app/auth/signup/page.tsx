import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { AuthPanel } from "@/components/auth-panel";
import { getAuthContext } from "@/lib/auth-context";

export default async function SignupPage() {
  const { user, membership, site } = await getAuthContext();

  if (user) {
    if (!membership) {
      redirect("/onboarding");
    }

    redirect(site ? "/app/overview" : "/onboarding/site");
  }

  return (
    <AuthPageShell
      eyebrow="Criar acesso"
      title="Comece sua jornada"
      description="Crie sua conta em segundos e desbloqueie o poder da automação de conteúdo otimizado."
      note="Sem cartão de crédito necessário. Teste todas as funcionalidades por 7 dias."
    >
      <AuthPanel mode="signup">
        <AuthForm mode="signup" />
      </AuthPanel>
    </AuthPageShell>
  );
}
