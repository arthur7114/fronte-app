import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { AuthPanel } from "@/components/auth-panel";
import { getAuthContext } from "@/lib/auth-context";

export default async function LoginPage() {
  const { user, membership, site } = await getAuthContext();

  if (user) {
    if (!membership) {
      redirect("/onboarding");
    }

    redirect(site ? "/app/overview" : "/onboarding/site");
  }

  return (
    <AuthPageShell
      eyebrow="Acesso"
      title="Volte para o seu espaco de trabalho."
      description="Entrar continua direto: sem distracoes, sem bifurcacoes e com o caminho certo para retomar a operacao."
      note="O acesso usa email e senha. Se a sessao for valida, o fluxo segue para a etapa correta do app."
    >
      <AuthPanel mode="login">
        <AuthForm mode="login" />
      </AuthPanel>
    </AuthPageShell>
  );
}
