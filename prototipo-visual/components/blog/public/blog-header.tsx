import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PublicBlogHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/blog" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">CD</span>
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            Clínica Dental
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="#" className="transition-colors hover:text-foreground">
            Início
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            Serviços
          </Link>
          <Link href="/blog" className="font-medium text-foreground">
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
