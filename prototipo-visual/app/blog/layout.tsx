import { PublicBlogHeader } from "@/components/blog/public/blog-header"
import { PublicBlogFooter } from "@/components/blog/public/blog-footer"

export default function PublicBlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicBlogHeader />
      <main className="flex-1">{children}</main>
      <PublicBlogFooter />
    </div>
  )
}
