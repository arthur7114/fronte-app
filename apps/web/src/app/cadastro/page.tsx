import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { getAuthContext } from "@/lib/auth-context";

export default async function SignupPage() {
  const { user, membership, site } = await getAuthContext();

  if (user) {
    if (!membership) redirect("/onboarding");
    redirect(site ? "/dashboard" : "/onboarding/site");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col justify-center px-8 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-12 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">ContentAI</span>
          </Link>

          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">1</span>
              <span className="font-medium text-foreground">Criar conta</span>
              <div className="h-px flex-1 bg-border" />
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">2</span>
              <div className="h-px flex-1 bg-border" />
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">3</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Crie sua conta</h1>
            <p className="mt-2 text-muted-foreground">
              Comece a gerar trafego organico para seu negocio em minutos.
            </p>
          </div>

          <AuthForm mode="signup" />
        </div>
      </div>

      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-primary/5 p-12 lg:flex">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="mb-4 text-balance text-3xl font-semibold text-foreground">
            Seu blog profissional em minutos, nao em meses.
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            A ContentAI cuida de toda a estrategia de SEO enquanto voce foca no que realmente importa: seu negocio.
          </p>
          <div className="mt-12 space-y-4">
            {["Setup em menos de 5 minutos", "Sem necessidade de conhecimento tecnico", "Conteudo otimizado por IA"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
