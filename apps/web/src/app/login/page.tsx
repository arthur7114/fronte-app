import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, FileText, Sparkles, TrendingUp } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { getAuthContext } from "@/lib/auth-context";

export default async function LoginPage() {
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
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Bem-vindo de volta</h1>
            <p className="mt-2 text-muted-foreground">
              Entre na sua conta para continuar gerenciando seu conteudo.
            </p>
          </div>

          <AuthForm mode="login" />
        </div>
      </div>

      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-primary/5 p-12 lg:flex">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-12 space-y-4">
            {[
              { icon: TrendingUp, title: "+300% em trafego organico", description: "Aumente visitas com conteudo otimizado para SEO e GEO." },
              { icon: FileText, title: "Conteudo em minutos", description: "Nossa IA cria artigos completos e otimizados automaticamente." },
              { icon: BarChart3, title: "Resultados mensuraveis", description: "Acompanhe o crescimento com analytics simplificados." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-5 text-left shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="leading-relaxed text-foreground italic">
              &quot;Em 3 meses triplicamos nosso trafego organico. A plataforma faz todo o trabalho pesado de SEO.&quot;
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <span className="text-sm font-medium text-primary">MR</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Maria Ribeiro</p>
                <p className="text-xs text-muted-foreground">Clinica Bem Estar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
