import Link from "next/link"
import { Button } from "@/components/ui/button"

type PublicBlogHeaderProps = {
  siteName?: string
  logoUrl?: string | null
  basePath?: string
}

export function PublicBlogHeader({
  siteName = "Clinica Dental",
  logoUrl,
  basePath = "/blog",
}: PublicBlogHeaderProps) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href={basePath} className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-primary">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteName} className="h-full w-full object-contain p-1" />
            ) : (
              <span className="text-sm font-bold text-primary-foreground">
                {siteName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            {siteName}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="#" className="transition-colors hover:text-foreground">
            Inicio
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            Servicos
          </Link>
          <Link href={basePath} className="font-medium text-foreground">
            Blog
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            Contato
          </Link>
        </nav>

        <Button size="sm" asChild>
          <Link href="#agendar">Agendar consulta</Link>
        </Button>
      </div>
    </header>
  )
}
