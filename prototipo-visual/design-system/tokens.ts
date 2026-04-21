/**
 * ContentAI — Design tokens (espelho tipado)
 *
 * Estes valores existem aqui APENAS para documentação e para alimentar a
 * página `/design-system`. A fonte da verdade em runtime são as variáveis
 * CSS definidas em `app/globals.css`.
 *
 * Se você mudar uma cor aqui, mude também no `globals.css` (ou vice-versa).
 */

export type ColorToken = {
  /** Nome da variável CSS (sem o `--`). */
  name: string
  /** Valor CSS em oklch, só para referência visual. */
  value: string
  /** Descrição curta do uso recomendado. */
  usage: string
}

export const surfaceTokens: ColorToken[] = [
  { name: "background", value: "oklch(0.985 0.002 240)", usage: "Fundo da página" },
  { name: "card", value: "oklch(1 0 0)", usage: "Containers principais" },
  { name: "popover", value: "oklch(1 0 0)", usage: "Menus, dropdowns e diálogos" },
  { name: "muted", value: "oklch(0.94 0.005 240)", usage: "Fundo sutil de seções secundárias" },
  { name: "sidebar", value: "oklch(1 0 0)", usage: "Barra lateral do painel" },
  { name: "border", value: "oklch(0.91 0.005 240)", usage: "Separadores e bordas" },
]

export const textTokens: ColorToken[] = [
  { name: "foreground", value: "oklch(0.15 0.01 240)", usage: "Texto principal" },
  { name: "muted-foreground", value: "oklch(0.5 0.01 240)", usage: "Texto secundário, labels" },
  { name: "primary-foreground", value: "oklch(1 0 0)", usage: "Texto sobre --primary" },
]

export const actionTokens: ColorToken[] = [
  { name: "primary", value: "oklch(0.55 0.15 175)", usage: "Acento teal, CTAs, estado ativo" },
  { name: "accent", value: "oklch(0.55 0.15 175)", usage: "Realces pontuais (alias do primary)" },
  { name: "destructive", value: "oklch(0.577 0.245 27.325)", usage: "Ações irreversíveis" },
  { name: "success", value: "oklch(0.65 0.18 145)", usage: "Publicado, aprovado" },
  { name: "warning", value: "oklch(0.75 0.15 75)", usage: "Avisos, rascunho, agendado" },
  { name: "ring", value: "oklch(0.55 0.15 175)", usage: "Foco de teclado" },
]

export const chartTokens: ColorToken[] = [
  { name: "chart-1", value: "oklch(0.55 0.15 175)", usage: "Série primária (teal)" },
  { name: "chart-2", value: "oklch(0.65 0.12 200)", usage: "Série secundária (ciano)" },
  { name: "chart-3", value: "oklch(0.45 0.10 220)", usage: "Série terciária (azul profundo)" },
  { name: "chart-4", value: "oklch(0.75 0.10 150)", usage: "Série quaternária (verde suave)" },
  { name: "chart-5", value: "oklch(0.60 0.08 260)", usage: "Série quinária (índigo neutro)" },
]

export type TypeToken = {
  label: string
  /** Classes Tailwind que compõem o estilo. */
  className: string
  /** Exemplo de uso. */
  usage: string
}

export const typographyScale: TypeToken[] = [
  {
    label: "Título de página",
    className: "text-3xl font-bold tracking-tight",
    usage: "H1 do topo de cada rota do dashboard",
  },
  {
    label: "Título de seção",
    className: "text-2xl font-semibold",
    usage: "Divisões grandes dentro de uma página",
  },
  {
    label: "Título de card",
    className: "text-xl font-semibold",
    usage: "Cabeçalho de cards e módulos",
  },
  {
    label: "Corpo",
    className: "text-base leading-relaxed",
    usage: "Parágrafos e descrições padrão",
  },
  {
    label: "Meta",
    className: "text-sm text-muted-foreground",
    usage: "Tabelas, formulários, metadados",
  },
  {
    label: "Eyebrow",
    className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
    usage: "Labels acima de títulos e agrupadores",
  },
]

export type RadiusToken = {
  label: string
  /** Classe Tailwind correspondente. */
  className: string
  usage: string
}

export const radiusScale: RadiusToken[] = [
  { label: "sm", className: "rounded-sm", usage: "Chips, tags inline" },
  { label: "md", className: "rounded-md", usage: "Inputs, botões pequenos" },
  { label: "lg (base)", className: "rounded-lg", usage: "Cards, containers" },
  { label: "xl", className: "rounded-xl", usage: "Cards de destaque, heros" },
  { label: "full", className: "rounded-full", usage: "Avatares, pills" },
]

export type SpaceToken = {
  label: string
  className: string
  remValue: string
}

export const spacingScale: SpaceToken[] = [
  { label: "2", className: "size-2", remValue: "0.5rem" },
  { label: "3", className: "size-3", remValue: "0.75rem" },
  { label: "4", className: "size-4", remValue: "1rem" },
  { label: "6", className: "size-6", remValue: "1.5rem" },
  { label: "8", className: "size-8", remValue: "2rem" },
  { label: "12", className: "size-12", remValue: "3rem" },
  { label: "16", className: "size-16", remValue: "4rem" },
]
