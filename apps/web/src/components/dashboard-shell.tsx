import Link from "next/link";
import { STATUS_LABELS, type DemoPost, type DemoSite } from "@/components/cms-demo-data";

type DashboardShellProps = {
  tenantName: string;
  tenantSlug: string;
  role: string;
  email: string;
  site: DemoSite;
  posts: DemoPost[];
};

export function DashboardShell({
  tenantName,
  tenantSlug,
  role,
  email,
  site,
  posts,
}: DashboardShellProps) {
  const publishedPosts = posts.filter((post) => post.status === "published");

  return (
    <section className="space-y-6">
      <div className="border border-black/12 bg-[rgba(255,255,255,0.84)] p-6 shadow-[0_24px_80px_rgba(17,17,17,0.08)] sm:p-8">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
              Painel
            </p>
            <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">
              O editor agora tem um ponto de entrada claro.
            </h2>
            <p className="max-w-xl text-base leading-8 text-black/66">
              O primeiro ciclo de blog vive aqui: site, posts e blog publico com
              uma navegacao direta para o que precisa ser feito agora.
            </p>

            <div className="flex flex-wrap gap-3 pt-2 text-xs uppercase tracking-[0.22em] text-black/50">
              <span className="border border-black/10 bg-white/75 px-3 py-1">
                {tenantName}
              </span>
              <span className="border border-black/10 bg-white/75 px-3 py-1">
                {site.subdomain}
              </span>
              <span className="border border-black/10 bg-white/75 px-3 py-1">
                {site.language}
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="border border-black/10 bg-[#fbf7f1] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                Site
              </p>
              <p className="mt-2 text-lg font-medium text-black">{site.name}</p>
              <p className="mt-1 text-sm text-black/55">{site.theme}</p>
              <p className="mt-1 text-sm text-black/55">Workspace: {tenantSlug}</p>
            </div>
            <div className="border border-black/10 bg-[#fbf7f1] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                Publicados
              </p>
              <p className="mt-2 text-lg font-medium text-black">{publishedPosts.length}</p>
              <p className="mt-1 text-sm text-black/55">
                Ultima publicacao: {publishedPosts[0]?.publishedAt ?? "—"}
              </p>
            </div>
            <div className="border border-black/10 bg-[#fbf7f1] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                Contexto
              </p>
              <p className="mt-2 text-lg font-medium text-black">{email}</p>
              <p className="mt-1 text-sm text-black/55">Papel: {role}</p>
              <Link
                href="/"
                className="mt-2 inline-flex text-sm text-black underline decoration-black/25 underline-offset-4"
              >
                Voltar para a pagina inicial
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="border border-black/10 bg-[#f8f3ec] p-5 transition duration-200 hover:-translate-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
            Posts recentes
          </p>
          <div className="mt-4 space-y-3">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                href={`/app/posts/${post.id}`}
                className="block border border-black/10 bg-white/80 p-4 transition duration-200 hover:-translate-y-0.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-black">{post.title}</p>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-black/46">
                    {STATUS_LABELS[post.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-black/56">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </article>
        <article className="border border-black/10 bg-[#f8f3ec] p-5 transition duration-200 hover:-translate-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
            Proximos passos
          </p>
          <p className="mt-3 text-2xl font-semibold text-black">
            Site, posts e blog publico.
          </p>
          <p className="mt-2 text-sm leading-7 text-black/64">
            Comece em /app/site, depois publique no /app/posts e confira o blog em
            /blog/{site.subdomain}.
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link href="/app/site" className="underline decoration-black/25 underline-offset-4">
              Configurar site
            </Link>
            <Link href="/app/posts" className="underline decoration-black/25 underline-offset-4">
              Abrir posts
            </Link>
            <Link
              href={`/blog/${site.subdomain}`}
              className="underline decoration-black/25 underline-offset-4"
            >
              Ver blog publico
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
