import { BlogPreview } from "@/components/blog/blog-preview"
import { TemplateSelector } from "@/components/blog/template-selector"
import { BlogCustomization } from "@/components/blog/blog-customization"
import { BlogSettings } from "@/components/blog/blog-settings"

export default function MeuBlogPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Meu Blog
        </h1>
        <p className="mt-1 text-muted-foreground">
          Configure a aparência e as integrações do seu blog.
        </p>
      </div>

      {/* Blog Preview */}
      <BlogPreview />

      {/* Template Selection */}
      <TemplateSelector />

      {/* Customization */}
      <BlogCustomization />

      {/* Settings */}
      <BlogSettings />
    </div>
  )
}
