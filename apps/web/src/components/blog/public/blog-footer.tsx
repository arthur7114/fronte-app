import Link from "next/link"
import { NewsletterCTA } from "./newsletter-cta"

type PublicBlogFooterProps = {
  siteName?: string
  logoUrl?: string | null
  basePath?: string
}

export function PublicBlogFooter({
  siteName = "Clinica Dental",
  logoUrl,
  basePath = "/blog",
}: PublicBlogFooterProps) {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <NewsletterCTA variant="footer" origin="footer" />

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-primary">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={siteName} className="h-full w-full object-contain p-1" />
              ) : (
                <span className="text-xs font-bold text-primary-foreground">
                  {siteName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="font-medium text-foreground">{siteName}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors hover:text-foreground">
              Privacidade
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Termos
            </Link>
            <Link href={basePath} className="transition-colors hover:text-foreground">
              Blog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
