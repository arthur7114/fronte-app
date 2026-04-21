# ContentAI — Design System

Sistema de design compartilhado por todas as superfícies do produto:
painel interno (`/dashboard`), blog público (`/blog`) e páginas marketing.

A fonte da verdade viva está em:

- `app/globals.css` — tokens CSS (cores, radius, fontes) via `@theme inline`
- `components/ui/*` — primitivos shadcn/ui
- `design-system/tokens.ts` — espelho tipado dos tokens para uso em docs/preview
- `app/design-system/page.tsx` — página que renderiza tokens e componentes

Se um valor mudar aqui, ele muda em todo o produto.

---

## 1. Princípios

1. **Calmo e confiável.** Interface de ferramenta de trabalho, não de entretenimento.
   Baixo contraste cromático, poucos acentos, tipografia legível.
2. **Hierarquia por espaçamento, não por cor.** Primeiro `gap`, depois `weight`,
   só então `color`.
3. **Um acento, usado com parcimônia.** Teal (`--primary`) marca ação ou
   estado ativo — nunca decora.
4. **Dados em primeiro plano.** Cards neutros e bordas discretas fazem os
   números e títulos falarem.
5. **Mobile-first.** Todo layout nasce em coluna única; `md:` e `lg:`
   adicionam colunas.

---

## 2. Cores

O tema usa `oklch` por perceptibilidade uniforme entre matizes.

### Superfícies

| Token | Uso |
|---|---|
| `--background` | Fundo da página |
| `--card` | Containers principais (branco puro) |
| `--popover` | Menus, dropdowns e diálogos |
| `--muted` | Fundo sutil de seções secundárias |
| `--sidebar` | Barra lateral do painel |

### Texto

| Token | Uso |
|---|---|
| `--foreground` | Texto principal |
| `--muted-foreground` | Texto secundário, labels, descrições |
| `--primary-foreground` | Texto sobre fundo `--primary` |

### Ações e estados

| Token | Uso |
|---|---|
| `--primary` | Acento teal — CTAs, estado ativo, links |
| `--accent` | Alias do primary para realces pontuais |
| `--destructive` | Ações irreversíveis (excluir, banir) |
| `--success` | Confirmações, publicado, aprovado |
| `--warning` | Avisos, rascunhos, agendado |
| `--border` | Separadores e borda padrão |
| `--ring` | Foco de teclado |

### Gráficos

`--chart-1` a `--chart-5` são variações frias derivadas do primary.
Sempre começar por `--chart-1` e adicionar conforme série cresce.

**Regra:** nunca usar `bg-white`, `text-black`, cores diretas do Tailwind
(`bg-blue-500`) dentro do produto. Sempre o token semântico.

---

## 3. Tipografia

- **Família única:** Inter, via `next/font` em `app/layout.tsx`.
- Variável CSS: `--font-sans`. Classe utilitária: `font-sans`.
- `leading-relaxed` para corpo; títulos usam o default.
- Preferir `text-balance` em títulos e `text-pretty` em parágrafos de 2–4 linhas.

### Escala

| Classe | Uso |
|---|---|
| `text-3xl font-bold` | Título de página |
| `text-2xl font-semibold` | Título de seção |
| `text-xl font-semibold` | Título de card |
| `text-base` | Corpo padrão |
| `text-sm` | Tabelas, formulários, metadados |
| `text-xs uppercase tracking-wide text-muted-foreground` | Labels e eyebrows |

No blog público (`/blog/[slug]`), o corpo sobe para `text-lg leading-relaxed`
para leitura longa.

---

## 4. Espaçamento e raio

- Escala: usar **sempre** os degraus do Tailwind (`p-2`, `p-4`, `p-6`, `p-8`).
  Nunca valores arbitrários como `p-[17px]`.
- Espaçamento entre elementos-irmãos: `gap-*` em flex/grid, nunca `space-y-*`.
- Raio base: `--radius: 0.75rem` (`rounded-lg`).
  - `rounded-md` em inputs e botões pequenos.
  - `rounded-xl` em cards de destaque.
  - `rounded-full` apenas em avatares e pills.

---

## 5. Layout

Prioridade (na ordem):

1. **Flex** para quase tudo (`flex items-center justify-between`).
2. **Grid** para layouts 2D reais (dashboards, galerias).
3. Nunca `float` ou `position: absolute` sem necessidade.

Container padrão do dashboard:

\`\`\`tsx
<div className="container mx-auto max-w-7xl p-6 md:p-8">
  {/* conteúdo */}
</div>
\`\`\`

Header de página:

\`\`\`tsx
<header className="mb-8 flex items-start justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold tracking-tight text-balance">...</h1>
    <p className="mt-1 text-muted-foreground">...</p>
  </div>
  <div className="flex gap-2">{/* ações */}</div>
</header>
\`\`\`

---

## 6. Componentes

Primitivos vêm de `components/ui/*` (shadcn). Padrões:

- **Formulário:** `FieldGroup` + `Field` + `FieldLabel`. Nunca `div` + `space-y-*`.
- **Input com ícone:** `InputGroup` + `InputGroupInput` + `InputGroupAddon`.
- **Loading em botão:** `<Spinner />`.
- **Estado vazio:** `<Empty />`.
- **Grupo de ações:** `ButtonGroup`.
- **Toggle de estado:** `ToggleGroup`.

### Badges

- Status publicado → `success`
- Status agendado / rascunho → `warning`
- Status reprovado / banido → `destructive`
- Categorias e tags → `secondary`

### Estados vazios

Cabeçalho curto, descrição em `muted-foreground`, um único CTA primário.

### Tabelas de dados

- Zebra sutil (`even:bg-muted/30`) somente em listagens longas.
- Ações por linha em `DropdownMenu` no canto direito.
- Seleção em massa com `Checkbox` + barra flutuante abaixo do header.

---

## 7. Ícones

- Biblioteca: `lucide-react`.
- Tamanhos permitidos: `h-4 w-4` (16px), `h-5 w-5` (20px), `h-6 w-6` (24px).
- Ícone sempre acompanha texto em botões; `sr-only` quando isolado.
- Nunca usar emojis como ícone de UI.

---

## 8. Gráficos

- Sempre via `components/ui/chart.tsx` (wrapper do Recharts).
- Cores como `var(--chart-1)`, não literais.
- Eixo Y escondido quando o valor já aparece no tooltip.
- Grid apenas horizontal (`CartesianGrid vertical={false}`).

---

## 9. Imagens

- Geradas pela `GenerateImage` em `/public/blog/*.jpg`.
- Sempre `alt` descritivo.
- Aspect ratio fixo no contêiner (`aspect-video`, `aspect-[4/3]`) para evitar CLS.

---

## 10. Visualização viva

Acesse **`/design-system`** no app rodando para ver tokens e componentes
renderizados com os valores reais em uso.
