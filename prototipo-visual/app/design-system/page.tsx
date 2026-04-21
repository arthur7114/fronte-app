import Link from "next/link"
import { ArrowLeft, Check, Mail, Plus, Search, Sparkles, Trash2 } from "lucide-react"
import {
  actionTokens,
  chartTokens,
  radiusScale,
  surfaceTokens,
  textTokens,
  typographyScale,
  type ColorToken,
} from "@/design-system/tokens"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function DesignSystemPage() {
  return (
    <div className="container mx-auto max-w-5xl px-6 py-12 md:py-16">
      <TopBar />
      <Hero />

      <Section
        eyebrow="01"
        title="Cores"
        description="Tokens semânticos em oklch. Sempre usar a variável, nunca o valor literal."
      >
        <div className="space-y-10">
          <TokenGroup title="Superfícies" tokens={surfaceTokens} />
          <TokenGroup title="Texto" tokens={textTokens} />
          <TokenGroup title="Ações e estados" tokens={actionTokens} />
          <TokenGroup title="Gráficos" tokens={chartTokens} />
        </div>
      </Section>

      <Section
        eyebrow="02"
        title="Tipografia"
        description="Família única (Inter). Hierarquia por peso e tamanho, nunca por cor."
      >
        <Card>
          <CardContent className="divide-y p-0">
            {typographyScale.map((t) => (
              <div
                key={t.label}
                className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div className={t.className}>Clareza vence criatividade</div>
                <div className="flex flex-col text-right text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{t.label}</span>
                  <code className="font-mono">{t.className}</code>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      <Section
        eyebrow="03"
        title="Raio"
        description="Base em 0.75rem. Use a escala, evite valores arbitrários."
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {radiusScale.map((r) => (
            <div key={r.label} className="flex flex-col items-center gap-3 rounded-lg border bg-card p-4">
              <div className={`h-16 w-16 border-2 border-primary/60 bg-primary/10 ${r.className}`} />
              <div className="text-center">
                <div className="text-sm font-medium">{r.label}</div>
                <code className="text-xs text-muted-foreground">{r.className}</code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="04"
        title="Botões"
        description="Ação primária única por contexto. Variantes ghost e outline para secundárias."
      >
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-6">
            <Button>
              <Sparkles className="h-4 w-4" />
              Gerar artigo
            </Button>
            <Button variant="secondary">Salvar rascunho</Button>
            <Button variant="outline">
              <Plus className="h-4 w-4" />
              Nova estratégia
            </Button>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
            <Button size="sm">Ação pequena</Button>
            <Button size="icon" aria-label="Confirmar">
              <Check className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </Section>

      <Section
        eyebrow="05"
        title="Badges"
        description="Sempre mapeadas a um estado: publicado, agendado, reprovado, categoria."
      >
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-6">
            <Badge>Padrão</Badge>
            <Badge variant="secondary">Categoria</Badge>
            <Badge variant="outline">Tag</Badge>
            <Badge className="bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90">
              Publicado
            </Badge>
            <Badge className="bg-[var(--warning)] text-[var(--warning-foreground)] hover:bg-[var(--warning)]/90">
              Agendado
            </Badge>
            <Badge variant="destructive">Reprovado</Badge>
          </CardContent>
        </Card>
      </Section>

      <Section
        eyebrow="06"
        title="Formulário"
        description="Label acima do campo, descrição curta abaixo. Validação aparece no foco saído."
      >
        <Card>
          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ds-name">Nome da estratégia</Label>
              <Input id="ds-name" placeholder="Ex.: Blog SEO 2026" />
              <p className="text-xs text-muted-foreground">Use algo curto e direto.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ds-search">Buscar artigos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="ds-search" className="pl-9" placeholder="Palavra-chave, título..." />
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section
        eyebrow="07"
        title="Card de dados"
        description="Padrão de KPI: label discreto, número em destaque, delta colorido."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard label="Leads no mês" value="1.284" delta="+12%" positive />
          <KpiCard label="Artigos publicados" value="47" delta="+3" positive />
          <KpiCard label="Taxa de rejeição" value="32%" delta="-4%" positive />
        </div>
      </Section>

      <Section
        eyebrow="08"
        title="CTA inline"
        description="Bloco único de conversão. Nunca usar gradientes; apoiar no primary."
      >
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Receba conteúdo novo toda semana</h3>
                <p className="text-sm text-muted-foreground">
                  Dicas práticas de SEO, IA e marketing direto no seu e-mail.
                </p>
              </div>
            </div>
            <div className="flex w-full gap-2 md:w-auto">
              <Input placeholder="seu@email.com" className="md:w-64" />
              <Button>Assinar</Button>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Footer />
    </div>
  )
}

function TopBar() {
  return (
    <div className="mb-12 flex items-center justify-between">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao painel
      </Link>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        v1.0 — Abril de 2026
      </span>
    </div>
  )
}

function Hero() {
  return (
    <header className="mb-16 max-w-3xl">
      <span className="text-xs font-medium uppercase tracking-wide text-primary">Design System</span>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance md:text-5xl">
        A linguagem visual da ContentAI
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
        Tokens, componentes e padrões que fazem o painel, o blog público e as
        comunicações soarem como o mesmo produto. Tudo o que está aqui é o que
        está em produção — mude o token, muda a interface inteira.
      </p>
    </header>
  )
}

function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-16">
      <div className="mb-6 flex items-end justify-between gap-6 border-b pb-4">
        <div>
          <span className="font-mono text-xs text-muted-foreground">{eyebrow}</span>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function TokenGroup({ title, tokens }: { title: string; tokens: ColorToken[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {tokens.map((t) => (
          <TokenSwatch key={t.name} token={t} />
        ))}
      </div>
    </div>
  )
}

function TokenSwatch({ token }: { token: ColorToken }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div
        className="h-12 w-12 shrink-0 rounded-md border"
        style={{ background: `var(--${token.name})` }}
        aria-hidden
      />
      <div className="flex min-w-0 flex-col">
        <code className="font-mono text-sm font-medium">--{token.name}</code>
        <span className="truncate text-xs text-muted-foreground">{token.usage}</span>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  delta,
  positive,
}: {
  label: string
  value: string
  delta: string
  positive: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wide">
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-3xl font-bold tabular-nums">{value}</CardTitle>
        <div
          className={`mt-2 text-sm font-medium ${
            positive ? "text-[var(--success)]" : "text-destructive"
          }`}
        >
          {delta} vs. mês anterior
        </div>
      </CardContent>
    </Card>
  )
}

function Footer() {
  return (
    <footer className="mt-24 border-t pt-6">
      <Separator className="mb-6" />
      <p className="text-xs text-muted-foreground">
        Fonte da verdade:{" "}
        <code className="font-mono">app/globals.css</code> para tokens,{" "}
        <code className="font-mono">components/ui/*</code> para primitivos,{" "}
        <code className="font-mono">design-system/</code> para documentação.
      </p>
    </footer>
  )
}
