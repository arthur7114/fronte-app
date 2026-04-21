"use client";

import { useState } from "react";
import { ArrowLeft, Bold, Eye, Heading2, Image, Italic, Link2, List, ListOrdered, Quote, RefreshCcw, Save, Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ArticleEditorProps = {
  articleId: string;
  onBack: () => void;
  isNew?: boolean;
};

const existingArticleData = {
  title: "Clareamento Dental: Caseiro ou no Consultorio?",
  metaDescription: "Descubra qual metodo de clareamento dental e melhor para voce: tratamento caseiro ou no consultorio do dentista.",
  content:
    "O clareamento dental e um dos procedimentos esteticos mais procurados nas clinicas odontologicas.\n\n## Clareamento no Consultorio\n\nO procedimento profissional utiliza geis de maior concentracao e supervisao de um dentista.\n\n## Clareamento Caseiro\n\nO tratamento em casa usa moldeiras personalizadas e acompanhamento profissional.",
};

const generatedArticleData = {
  title: "Beneficios do Clareamento Dental Profissional",
  metaDescription: "Saiba por que o clareamento dental profissional e a melhor escolha para um sorriso branco e saudavel.",
  content:
    "Ter dentes brancos deixou de ser apenas uma questao estetica e passou a representar saude, autocuidado e autoestima.\n\n## Por que escolher o clareamento profissional?\n\nO dentista avalia suas condicoes bucais antes de comecar o tratamento, trazendo mais seguranca e previsibilidade.",
};

export function ArticleEditor({ onBack, isNew = false }: ArticleEditorProps) {
  const articleData = isNew ? generatedArticleData : existingArticleData;
  const [title, setTitle] = useState(articleData.title);
  const [metaDescription, setMetaDescription] = useState(articleData.metaDescription);
  const [content, setContent] = useState(articleData.content);
  const toolbarButtons = [
    { icon: Bold, label: "Negrito" },
    { icon: Italic, label: "Italico" },
    { icon: Heading2, label: "Subtitulo" },
    { icon: List, label: "Lista" },
    { icon: ListOrdered, label: "Lista numerada" },
    { icon: Quote, label: "Citacao" },
    { icon: Link2, label: "Link" },
    { icon: Image, label: "Imagem" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button variant="ghost" onClick={onBack} className="w-fit gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para artigos
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="gap-2"><Eye className="h-4 w-4" />Visualizar</Button>
          <Button variant="outline" className="gap-2"><Save className="h-4 w-4" />Salvar rascunho</Button>
          <Button className="gap-2"><Send className="h-4 w-4" />Publicar</Button>
        </div>
      </div>

      {isNew ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Artigo gerado pela IA com sucesso</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Revise, edite e ajuste o conteudo antes de publicar.</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <label className="mb-2 block text-sm font-medium text-foreground">Titulo do artigo</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full border-0 bg-transparent text-xl font-semibold text-foreground outline-none placeholder:text-muted-foreground"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{title.length}/70 caracteres</span>
                <Button variant="ghost" size="sm" className="gap-1 text-primary"><Sparkles className="h-3 w-3" />Sugerir titulo</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <label className="mb-2 block text-sm font-medium text-foreground">Descricao para buscadores</label>
              <textarea
                value={metaDescription}
                onChange={(event) => setMetaDescription(event.target.value)}
                rows={2}
                className="w-full resize-none border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{metaDescription.length}/160 caracteres</span>
                <Button variant="ghost" size="sm" className="gap-1 text-primary"><Sparkles className="h-3 w-3" />Gerar descricao</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center gap-1 border-b border-border p-2">
                {toolbarButtons.map((button) => (
                  <Button key={button.label} variant="ghost" size="icon" className="h-8 w-8" title={button.label}>
                    <button.icon className="h-4 w-4" />
                  </Button>
                ))}
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" className="gap-1 text-primary"><RefreshCcw className="h-3 w-3" />Regenerar</Button>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={20}
                  className="w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex items-center justify-between border-t border-border p-4">
                <span className="text-xs text-muted-foreground">{content.split(/\s+/).length} palavras</span>
                <Button variant="outline" size="sm" className="gap-2"><Sparkles className="h-4 w-4" />Expandir com IA</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4 font-medium text-foreground">Pontuacao SEO</h3>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20">
                  <svg className="h-20 w-20 -rotate-90 transform">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={226} strokeDashoffset={226 * (1 - 0.78)} className="text-green-500" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">78</span>
                </div>
                <div><p className="text-sm font-medium text-green-600">Bom</p><p className="text-xs text-muted-foreground">Seu artigo esta bem otimizado.</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4 font-medium text-foreground">Lista de verificacao</h3>
              <div className="space-y-3">
                {["Titulo contem palavra-chave", "Meta descricao preenchida", "Subtitulos presentes", "Links internos adicionados", "Imagens com alt text"].map((label, index) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full ${index < 3 ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                      {index < 3 ? "✓" : "○"}
                    </div>
                    <span className={`text-sm ${index < 3 ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 font-medium text-foreground">Palavras-chave alvo</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">clareamento dental</Badge>
                <Badge variant="secondary">clareamento caseiro</Badge>
                <Badge variant="secondary">clareamento consultorio</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
