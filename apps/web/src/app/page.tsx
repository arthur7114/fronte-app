import Link from "next/link";
import { redirect } from "next/navigation";
import { PageFrame } from "@/components/page-frame";
import { getAuthContext } from "@/lib/auth-context";

export default async function HomePage() {
  const { user, tenant } = await getAuthContext();

  if (user) {
    redirect(tenant ? "/app" : "/onboarding");
  }

  return (
    <PageFrame
      eyebrow="Base do MVP"
      title={<>Acesso, site e primeiro blog.</>}
      description="O produto agora mostra o caminho completo do bloco 2: entrar, configurar o site, abrir o CMS e ver o blog publico por caminho."
      aside={
        <div className="w-full max-w-sm border border-black/12 bg-white/85 p-5 shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Fluxo
          </p>
          <div className="mt-4 space-y-4">
            <div className="border-b border-black/8 pb-4">
              <p className="text-sm font-medium text-black/55">1. Site</p>
              <p className="mt-1 text-lg font-semibold text-black">Configurar nome, idioma e subdominio</p>
            </div>
            <div className="border-b border-black/8 pb-4">
              <p className="text-sm font-medium text-black/55">2. Posts</p>
              <p className="mt-1 text-lg font-semibold text-black">Criar, editar e acompanhar status</p>
            </div>
            <div>
              <p className="text-sm font-medium text-black/55">3. Blog</p>
              <p className="mt-1 text-lg font-semibold text-black">Publicar e abrir a rota publica</p>
            </div>
          </div>
        </div>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="border border-black/10 bg-white/82 p-5 transition duration-200 hover:-translate-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
            Entradas
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
            Site, posts e blog publico no mesmo fluxo.
          </p>
        </article>
        <article className="border border-black/10 bg-[#f8f3ec] p-5 transition duration-200 hover:-translate-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
            Rotas
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
            /app/site, /app/posts e /blog/[subdomain].
          </p>
        </article>
        <article className="border border-black/10 bg-white/82 p-5 transition duration-200 hover:-translate-y-1 sm:col-span-2 xl:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
            Entrada
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link href="/auth/signup" className="underline decoration-black/25 underline-offset-4">
              Criar conta
            </Link>
            <Link href="/auth/login" className="underline decoration-black/25 underline-offset-4">
              Entrar
            </Link>
            <Link href="/app/site" className="underline decoration-black/25 underline-offset-4">
              Criar site
            </Link>
            <Link href="/app/posts" className="underline decoration-black/25 underline-offset-4">
              Abrir posts
            </Link>
            <Link href="/app" className="underline decoration-black/25 underline-offset-4">
              Continuar fluxo
            </Link>
          </div>
        </article>
      </section>
    </PageFrame>
  );
}
