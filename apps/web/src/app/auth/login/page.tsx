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

    redirect(site ? "/app/dashboard" : "/onboarding/site");
  }

  return (
    <AuthPageShell
      eyebrow="Acesso"
      title="Bem-vindo de volta"
      description="Gerencie seu conteúdo, acompanhe seus rankings e escale sua presença digital com inteligência."
      note="Sua segurança é nossa prioridade. Ao entrar, você concorda com nossos termos de serviço."
    >
      <AuthPanel mode="login">
        <AuthForm mode="login" />
      </AuthPanel>
    </AuthPageShell>
  );
}

