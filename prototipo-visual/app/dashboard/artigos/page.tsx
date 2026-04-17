"use client"

import { useState } from "react"
import { ArticlesList } from "@/components/articles/articles-list"
import { ArticleEditor } from "@/components/articles/article-editor"
import { GenerateArticleDialog } from "@/components/articles/generate-article-dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, LayoutList, Grid3X3 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ArtigosPage() {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  if (selectedArticle) {
    return (
      <ArticleEditor
        articleId={selectedArticle}
        isNew={selectedArticle === "new"}
        onBack={() => setSelectedArticle(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Artigos</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie e edite seus artigos em todas as etapas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-border p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md p-2 transition-colors",
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-md p-2 transition-colors",
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>

          {/* Auto Mode Toggle */}
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
            <span className="text-sm text-muted-foreground">Modo Auto</span>
            <button className="relative h-6 w-11 rounded-full bg-primary transition-colors">
              <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
            </button>
          </div>

          <Button
            className="gap-2"
            onClick={() => setShowGenerateDialog(true)}
          >
            <Sparkles className="h-4 w-4" />
            Gerar Artigo
          </Button>
        </div>
      </div>

      {/* Articles List */}
      <ArticlesList viewMode={viewMode} onSelectArticle={setSelectedArticle} />

      {/* Generate Article Dialog */}
      <GenerateArticleDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onGenerated={(id) => {
          setShowGenerateDialog(false)
          setSelectedArticle(id)
        }}
      />
    </div>
  )
}
