"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Tables } from "@super/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Sparkles,
  Save,
  Eye,
  Send,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Image,
  Heading2,
  Quote,
  RefreshCcw,
} from "lucide-react"

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
  return (
    result.seo_score === undefined ||
    typeof result.seo_score === "number"
  )
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

  const firstParagraph = content.split(/\n\s*\n/)[0] ?? ""
  const normalizedKeyword = keyword?.toLowerCase().trim()

  return [
    { label: "Título preenchido", done: title.trim().length >= 3 },
    { label: "Meta descrição preenchida", done: metaDescription.trim().length > 0 },
    { label: "Subtítulos (H2) presentes", done: /^##\s+/m.test(content) },
    {
      label: "Palavra-chave no primeiro parágrafo",
      done: normalizedKeyword ? firstParagraph.toLowerCase().includes(normalizedKeyword) : false,
    },
    { label: "Conteúdo com pelo menos 300 palavras", done: getWordCount(content) >= 300 },
    { label: "Score de SEO calculado", done: score !== null },
  ]
}

function getWordCount(content: string) {
  const trimmed = content.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export function ArticleEditor({
  articleId,
  onBack,
  onBackUrl,
  isNew = false,
  initialData,
}: ArticleEditorProps) {
  const router = useRouter()
  const generation = getArticleGeneration(initialData)
  const reviewResult = isReviewResult(generation?.review_result)
    ? generation.review_result
    : null
  const initialSeoScore = initialData?.seo_score ?? reviewResult?.seo_score ?? null
  const primaryKeyword = generation?.primary_keyword ?? null
  const postId = initialData?.id ?? articleId
  const isLocked = initialData ? LOCKED_STATUSES.has(initialData.status) : true

  const [title, setTitle] = useState(initialData?.title ?? "")
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description ?? "")
  const [content, setContent] = useState(initialData?.content ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

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

  const handleBack = () => {
    if (onBack) onBack()
    else if (onBackUrl) router.push(onBackUrl)
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      const { saveArticleDraft } = await import("@/app/dashboard/artigos/actions")
      const result = await saveArticleDraft(postId, {
        title,
        metaDescription,
        content,
      })

      if (result.error) throw new Error(result.error)

      toast.success("Rascunho salvo.")
      router.refresh()
    } catch (error) {
      toast.error("Não foi possível salvar o rascunho.", {
        description: getErrorMessage(error),
      })
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
      toast.error("Erro ao aprovar artigo", {
        description: getErrorMessage(error),
      })
    } finally {
      setIsApproving(false)
    }
  }

  const toolbarButtons = [
    { icon: Bold, label: "Negrito" },
    { icon: Italic, label: "Itálico" },
    { icon: Heading2, label: "Subtítulo" },
    { icon: List, label: "Lista" },
    { icon: ListOrdered, label: "Lista numerada" },
    { icon: Quote, label: "Citação" },
    { icon: Link2, label: "Link" },
    { icon: Image, label: "Imagem" },
  ]

  return (
    <div className="space-y-6">
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
              <RefreshCcw className="h-4 w-4 animate-spin" />
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
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {initialData?.status === "published" ? "Atualizar" : "Aprovar e Publicar"}
          </Button>
        </div>
      </div>

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
                Revise, edite e ajuste o conteúdo conforme necessário antes de publicar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLocked && (
        <Card className="border-border bg-muted/30">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Este artigo está com status <strong>{initialData?.status ?? "indisponível"}</strong>.
            Aguarde a geração terminar ou resolva o erro antes de editar.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Título do artigo
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full border-0 bg-transparent text-xl font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Digite o título..."
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {title.length}/70 caracteres
                </span>
                <Button variant="ghost" size="sm" className="gap-1 text-primary" disabled>
                  <Sparkles className="h-3 w-3" />
                  Sugerir título
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Descrição para buscadores
              </label>
              <textarea
                value={metaDescription}
                onChange={(event) => setMetaDescription(event.target.value)}
                rows={2}
                className="w-full resize-none border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Uma breve descrição do artigo para aparecer nos resultados de busca..."
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {metaDescription.length}/160 caracteres
                </span>
                <Button variant="ghost" size="sm" className="gap-1 text-primary" disabled>
                  <Sparkles className="h-3 w-3" />
                  Gerar descrição
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="flex items-center gap-1 border-b border-border p-2">
                {toolbarButtons.map((btn) => (
                  <Button
                    key={btn.label}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title={btn.label}
                    disabled
                  >
                    <btn.icon className="h-4 w-4" />
                  </Button>
                ))}
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" className="gap-1 text-primary" disabled>
                    <RefreshCcw className="h-3 w-3" />
                    Regenerar
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={20}
                  className="w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
                  placeholder="Comece a escrever seu artigo..."
                />
              </div>

              <div className="flex items-center justify-between border-t border-border p-4">
                <span className="text-xs text-muted-foreground">
                  {getWordCount(content)} palavras
                </span>
                <Button variant="outline" size="sm" className="gap-2" disabled>
                  <Sparkles className="h-4 w-4" />
                  Expandir com IA
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
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
                  <p className="text-xs text-muted-foreground">
                    {seoScore === null
                      ? "A revisão da IA ainda não calculou a pontuação deste artigo."
                      : "Pontuação carregada da revisão da IA."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4 font-medium text-foreground">Lista de verificação</h3>
              <div className="space-y-3">
                {checklist.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div
                      className={`h-5 w-5 rounded-full ${
                        item.done
                          ? "bg-green-100 text-green-600"
                          : "bg-muted text-muted-foreground"
                      } flex items-center justify-center`}
                    >
                      {item.done ? "✓" : "○"}
                    </div>
                    <span
                      className={`text-sm ${
                        item.done ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
