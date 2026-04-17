import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { getAuthContext } from "@/lib/auth-context";

export default async function LoginPage() {
  const { user, membership, site } = await getAuthContext();

  if (user) {
    if (!membership) {
      redirect("/onboarding");
    }

    redirect(site ? "/dashboard" : "/onboarding/site");
  }

  return (
    <AuthPageShell
      eyebrow="Acesso"
      title="Bem-vindo de volta"
      description="Acesse seu workspace, acompanhe o plano editorial e retome a operacao do conteudo pelo fluxo canonico do produto."
      note="Ao entrar, sua conta volta exatamente para o contexto atual do workspace."
    >
      <AuthPanel mode="login">
        <AuthForm mode="login" />
      </AuthPanel>
    </AuthPageShell>
  );
}
