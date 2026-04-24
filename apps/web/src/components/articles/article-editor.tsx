"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { marked } from "marked"
import { toast } from "sonner"
import type { Tables } from "@super/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Eye, Loader2, RefreshCcw, Save, Send, Sparkles } from "lucide-react"
import { RichEditor } from "@/components/editor/rich-editor"
import type { RichEditorRef } from "@/components/editor/rich-editor"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ArticleGeneration = Tables<"article_generations">
export type PostWithGeneration = Tables<"posts"> & {
  article_generations?: ArticleGeneration | ArticleGeneration[] | null
}

type ReviewResult = {
  seo_score?: number
  readability_score?: number
  feedback?: string[]
  approved?: boolean
  final_content?: string
}

type ArticleEditorProps = {
  articleId: string
  onBack?: () => void
  onBackUrl?: string
  isNew?: boolean
  initialData?: PostWithGeneration
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LOCKED_STATUSES = new Set(["queued", "generating", "publishing", "failed"])

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Erro inesperado."
}

function getArticleGeneration(post?: PostWithGeneration) {
  const relation = post?.article_generations
  if (Array.isArray(relation)) return relation[0] ?? null
  return relation ?? null
}

function isReviewResult(value: unknown): value is ReviewResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  const result = value as ReviewResult
  return result.seo_score === undefined || typeof result.seo_score === "number"
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score))
}

function getScoreLabel(score: number | null) {
  if (score === null) return "Aguardando revisão"
  if (score >= 80) return "Excelente"
  if (score >= 60) return "Bom"
  return "Revisar"
}

function getScoreColor(score: number | null) {
  if (score === null) return "text-muted-foreground"
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-amber-600"
  return "text-destructive"
}

/** Strip HTML tags and count words */
function getWordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  return text ? text.split(/\s+/).length : 0
}

/** Convert markdown to HTML, skip if already HTML */
function markdownToHtml(raw: string): string {
  if (!raw) return ""
  if (/<[a-z][\s\S]*>/i.test(raw)) return raw
  return marked.parse(raw) as string
}

function buildChecklist({
  title,
  metaDescription,
  content,
  keyword,
  review,
  score,
}: {
  title: string
  metaDescription: string
  content: string
  keyword?: string | null
  review: ReviewResult | null
  score: number | null
}) {
  if (review?.feedback?.length) {
    const done = review.approved ?? (score !== null && score >= 70)
    return review.feedback.map((label) => ({ label, done }))
  }

  // Extract first paragraph text from HTML
  const match = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  const firstParagraph = match
    ? match[1].replace(/<[^>]*>/g, "")
    : content.replace(/<[^>]*>/g, "").substring(0, 500)

  const normalizedKeyword = keyword?.toLowerCase().trim()

  return [
    { label: "Título preenchido", done: title.trim().length >= 3 },
    { label: "Meta descrição preenchida", done: metaDescription.trim().length > 0 },
    { label: "Subtítulos (H2) presentes", done: content.includes("<h2") },
    {
      label: "Palavra-chave no primeiro parágrafo",
      done: normalizedKeyword
        ? firstParagraph.toLowerCase().includes(normalizedKeyword)
        : false,
    },
    { label: "Conteúdo com pelo menos 300 palavras", done: getWordCount(content) >= 300 },
    { label: "Score de SEO calculado", done: score !== null },
  ]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ArticleEditor({
  articleId,
  onBack,
  onBackUrl,
  isNew = false,
  initialData,
}: ArticleEditorProps) {
  const router = useRouter()
  const editorRef = useRef<RichEditorRef>(null)

  const generation = getArticleGeneration(initialData)
  const reviewResult = isReviewResult(generation?.review_result)
    ? (generation.review_result as ReviewResult)
    : null
  const initialSeoScore = initialData?.seo_score ?? reviewResult?.seo_score ?? null
  const primaryKeyword = generation?.primary_keyword ?? null
  const postId = initialData?.id ?? articleId
  const isLocked = initialData ? LOCKED_STATUSES.has(initialData.status) : true

  const [title, setTitle] = useState(initialData?.title ?? "")
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description ?? "")
  // Convert markdown → HTML once on init
  const [content, setContent] = useState(() => markdownToHtml(initialData?.content ?? ""))
  const [isSaving, setIsSaving] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isSuggestingMeta, setIsSuggestingMeta] = useState(false)

  const seoScore = initialSeoScore === null ? null : clampScore(initialSeoScore)
  const scoreOffset = seoScore === null ? 226 : 226 * (1 - seoScore / 100)
  const scoreLabel = getScoreLabel(seoScore)
  const scoreColor = getScoreColor(seoScore)
  const checklist = buildChecklist({
    title,
    metaDescription,
    content,
    keyword: primaryKeyword,
    review: reviewResult,
    score: seoScore,
  })
  const wordCount = getWordCount(content)

  const handleBack = () => {
    if (onBack) onBack()
    else if (onBackUrl) router.push(onBackUrl)
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      const { saveArticleDraft } = await import("@/app/dashboard/artigos/actions")
      const result = await saveArticleDraft(postId, { title, metaDescription, content })
      if (result.error) throw new Error(result.error)
      toast.success("Rascunho salvo.")
      router.refresh()
    } catch (error) {
      toast.error("Não foi possível salvar o rascunho.", { description: getErrorMessage(error) })
    } finally {
      setIsSaving(false)
    }
  }

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const { approveAndSchedulePost } = await import("@/app/dashboard/artigos/actions")
      const res = await approveAndSchedulePost(postId, null)
      if (res?.error) throw new Error(res.error)
      toast.success("Artigo aprovado e publicado!")
      router.refresh()
    } catch (error) {
      toast.error("Erro ao aprovar artigo.", { description: getErrorMessage(error) })
    } finally {
      setIsApproving(false)
    }
  }

  const handleSuggestMeta = async (field: "title" | "description" | "both") => {
    const plainText = content.replace(/<[^>]*>/g, " ").trim()
    if (!plainText) {
      toast.error("Adicione conteúdo ao artigo antes de sugerir metadados.")
      return
    }
    setIsSuggestingMeta(true)
    try {
      const res = await fetch("/api/editor-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggest-meta", content: plainText }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (field !== "description" && data.title) setTitle(data.title)
      if (field !== "title" && data.metaDescription) setMetaDescription(data.metaDescription)
      toast.success("Metadados sugeridos pela IA ✦")
    } catch (error) {
      toast.error("Não foi possível sugerir metadados.", { description: getErrorMessage(error) })
    } finally {
      setIsSuggestingMeta(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para artigos
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" disabled>
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleSaveDraft}
            disabled={isLocked || isSaving || isApproving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar rascunho
          </Button>
          <Button
            className="gap-2"
            onClick={handleApprove}
            disabled={isLocked || isSaving || isApproving}
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {initialData?.status === "published" ? "Atualizar" : "Aprovar e Publicar"}
          </Button>
        </div>
      </div>

      {/* AI banner */}
      {isNew && !isLocked && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Artigo gerado pela IA com sucesso
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Revise, edite e ajuste o conteúdo. Selecione qualquer texto para formatação e ações de IA.
                Pressione <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">/</kbd> para
                inserir blocos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locked notice */}
      {isLocked && (
        <Card className="border-border bg-muted/30">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Este artigo está com status{" "}
            <strong>{initialData?.status ?? "indisponível"}</strong>. Aguarde a geração
            terminar ou resolva o erro antes de editar.
          </CardContent>
        </Card>
      )}

      {/* Main layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Title */}
          <Card>
            <CardContent className="p-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Título do artigo
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLocked}
                className="w-full border-0 bg-transparent text-xl font-semibold text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
                placeholder="Digite o título..."
              />
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs ${title.length > 70 ? "text-destructive" : "text-muted-foreground"}`}>
                  {title.length}/70 caracteres
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-primary"
                  onClick={() => handleSuggestMeta("title")}
                  disabled={isLocked || isSuggestingMeta}
                >
                  {isSuggestingMeta ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Sugerir título
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Meta description */}
          <Card>
            <CardContent className="p-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Descrição para buscadores
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                disabled={isLocked}
                rows={2}
                className="w-full resize-none border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
                placeholder="Uma breve descrição do artigo para aparecer nos resultados de busca..."
              />
              <div className="mt-2 flex items-center justify-between">
                <span
                  className={`text-xs ${metaDescription.length > 160 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {metaDescription.length}/160 caracteres
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-primary"
                  onClick={() => handleSuggestMeta("description")}
                  disabled={isLocked || isSuggestingMeta}
                >
                  {isSuggestingMeta ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Gerar descrição
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rich text editor */}
          <Card>
            <CardContent className="p-0">
              {/* Mini top bar */}
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <span className="text-xs text-muted-foreground">{wordCount} palavras</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    Pressione{" "}
                    <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">
                      /
                    </kbd>{" "}
                    para comandos · Selecione texto para formatar ou usar IA
                  </span>
                  <Button variant="ghost" size="sm" className="ml-2 gap-1 text-muted-foreground" disabled>
                    <RefreshCcw className="h-3 w-3" />
                    Regenerar
                  </Button>
                </div>
              </div>

              <RichEditor
                ref={editorRef}
                content={content}
                onChange={setContent}
                editable={!isLocked}
                placeholder="Comece a escrever ou pressione / para ver os comandos disponíveis..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* SEO Score */}
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4 font-medium text-foreground">Pontuação SEO</h3>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20">
                  <svg className="h-20 w-20 -rotate-90 transform">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    {seoScore !== null && (
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={226}
                        strokeDashoffset={scoreOffset}
                        className={scoreColor}
                      />
                    )}
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">
                    {seoScore ?? "--"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${scoreColor}`}>{scoreLabel}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {seoScore === null
                      ? "A revisão da IA ainda não calculou a pontuação."
                      : "Pontuação carregada da revisão da IA."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4 font-medium text-foreground">Lista de verificação</h3>
              <div className="space-y-3">
                {checklist.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                        item.done
                          ? "bg-green-100 text-green-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.done ? "✓" : "○"}
                    </div>
                    <span
                      className={`text-sm ${item.done ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 font-medium text-foreground">Palavras-chave alvo</h3>
              <div className="flex flex-wrap gap-2">
                {primaryKeyword ? (
                  <Badge variant="secondary">{primaryKeyword}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Nenhuma palavra-chave vinculada.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
