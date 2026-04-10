"use client"

import { useState } from "react"
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

type ArticleEditorProps = {
  articleId: string
  onBack: () => void
}

const articleData = {
  title: "Clareamento Dental: Caseiro ou no Consultório?",
  metaDescription: "Descubra qual método de clareamento dental é melhor para você: tratamento caseiro ou no consultório do dentista. Comparamos prós, contras e resultados.",
  content: `O clareamento dental é um dos procedimentos estéticos mais procurados nas clínicas odontológicas. Mas com tantas opções disponíveis, surge a dúvida: qual método escolher?

## Clareamento no Consultório

O clareamento profissional, realizado no consultório do dentista, utiliza géis com maior concentração de peróxido de hidrogênio ou carbamida. O procedimento é supervisionado por um profissional, garantindo maior segurança e resultados mais rápidos.

### Vantagens:
- Resultados visíveis em uma única sessão
- Supervisão profissional durante todo o processo
- Menor risco de sensibilidade quando bem aplicado

## Clareamento Caseiro

O clareamento caseiro é feito com moldeiras personalizadas e gel de menor concentração, aplicado em casa pelo próprio paciente sob orientação do dentista.

### Vantagens:
- Custo geralmente menor
- Flexibilidade de horários
- Tratamento gradual e controlado

## Qual Escolher?

A escolha depende de diversos fatores como orçamento, disponibilidade de tempo e expectativas de resultado. O ideal é consultar seu dentista para uma avaliação personalizada.`,
}

export function ArticleEditor({ onBack }: ArticleEditorProps) {
  const [title, setTitle] = useState(articleData.title)
  const [metaDescription, setMetaDescription] = useState(articleData.metaDescription)
  const [content, setContent] = useState(articleData.content)

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para artigos
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Salvar rascunho
          </Button>
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            Publicar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
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
                className="w-full border-0 bg-transparent text-xl font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Digite o título..."
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {title.length}/70 caracteres
                </span>
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  <Sparkles className="h-3 w-3" />
                  Sugerir título
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Meta Description */}
          <Card>
            <CardContent className="p-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Descrição para buscadores
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                className="w-full resize-none border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Uma breve descrição do artigo para aparecer nos resultados de busca..."
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {metaDescription.length}/160 caracteres
                </span>
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  <Sparkles className="h-3 w-3" />
                  Gerar descrição
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardContent className="p-0">
              {/* Toolbar */}
              <div className="flex items-center gap-1 border-b border-border p-2">
                {toolbarButtons.map((btn) => (
                  <Button
                    key={btn.label}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title={btn.label}
                  >
                    <btn.icon className="h-4 w-4" />
                  </Button>
                ))}
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" className="gap-1 text-primary">
                    <RefreshCcw className="h-3 w-3" />
                    Regenerar
                  </Button>
                </div>
              </div>

              {/* Editor Area */}
              <div className="p-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
                  placeholder="Comece a escrever seu artigo..."
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border p-4">
                <span className="text-xs text-muted-foreground">
                  {content.split(/\s+/).length} palavras
                </span>
                <Button variant="outline" size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Expandir com IA
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* AI Score */}
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
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={226}
                      strokeDashoffset={226 * (1 - 0.78)}
                      className="text-green-500"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">
                    78
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-600">Bom</p>
                  <p className="text-xs text-muted-foreground">
                    Seu artigo está bem otimizado para os buscadores.
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
                {[
                  { label: "Título contém palavra-chave", done: true },
                  { label: "Meta descrição preenchida", done: true },
                  { label: "Subtítulos (H2) presentes", done: true },
                  { label: "Palavra-chave no primeiro parágrafo", done: true },
                  { label: "Links internos adicionados", done: false },
                  { label: "Imagens com alt text", done: false },
                ].map((item) => (
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

          {/* Keywords */}
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 font-medium text-foreground">Palavras-chave alvo</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">clareamento dental</Badge>
                <Badge variant="secondary">clareamento caseiro</Badge>
                <Badge variant="secondary">clareamento consultório</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
