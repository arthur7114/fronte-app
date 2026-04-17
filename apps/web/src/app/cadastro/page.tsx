import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { getAuthContext } from "@/lib/auth-context";

export default async function SignupPage() {
  const { user, membership, site } = await getAuthContext();

  if (user) {
    if (!membership) {
      redirect("/onboarding");
    }

    redirect(site ? "/dashboard" : "/onboarding/site");
  }

  return (
    <AuthPageShell
      eyebrow="Criar acesso"
      title="Ative seu workspace"
      description="Crie a conta e siga direto para o onboarding em 3 etapas definido pelo prototipo visual."
      note="Sem configuracao extra: conta, workspace, site e briefing seguem na mesma jornada."
    >
      <AuthPanel mode="signup">
        <AuthForm mode="signup" />
      </AuthPanel>
    </AuthPageShell>
  );
}
