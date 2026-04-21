import { BlogCustomization } from "@/components/blog/blog-customization";
import { BlogPreview } from "@/components/blog/blog-preview";
import { BlogSettings } from "@/components/blog/blog-settings";
import { TemplateSelector } from "@/components/blog/template-selector";

export default function MeuBlogPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Meu Blog</h1>
        <p className="mt-1 text-muted-foreground">
          Configure a aparencia e as integracoes do seu blog.
        </p>
      </div>

      <BlogPreview />
      <TemplateSelector />
      <BlogCustomization />
      <BlogSettings />
    </div>
  );
}
