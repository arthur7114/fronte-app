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
      title="Abra seu primeiro espaco de trabalho."
      description="O cadastro mantem a mesma linguagem do login, mas ja conduz para a criacao do workspace sem parecer um formulario generico."
      note="Se o Supabase abrir sessao na hora, o proximo passo sera o onboarding. Se nao abrir, a confirmacao por email vira o fallback."
    >
      <AuthPanel mode="signup">
        <AuthForm mode="signup" />
      </AuthPanel>
    </AuthPageShell>
  );
}
