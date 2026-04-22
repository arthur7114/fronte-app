# UX e Arquitetura de Informacao - Redesign v4.0

> Fonte primaria visual: `prototipo-visual/`
> Fonte primaria do design system: `prototipo-visual/design-system/`

---

## Regra principal

O prototipo visual e a especificacao principal do front. Uma tela so e considerada convergida quando segue o prototipo em layout, hierarquia, blocos, densidade, navegacao local, estados visuais e interacoes visiveis.

---

## Design system

O design system do prototipo define:

- tokens em `app/globals.css`
- espelho tipado em `design-system/tokens.ts`
- pagina viva em `/design-system`
- primitivos `components/ui/*`
- regras de uso descritas em `design-system/README.md`

Esses itens valem para dashboard, blog publico, onboarding e telas futuras.

---

## Navegacao principal

```text
Dashboard
Meu Blog
Estrategias
Artigos
Calendario
Tendencias
Analytics
Newsletter
Leads
Configuracoes
```

O item antigo `Plano de Conteudo` deixa de ser a navegacao principal nesta versao visual. Planejamento passa a aparecer distribuido entre Estrategias, Artigos e Calendario conforme o prototipo novo.

---

## Fluxo do produto

```text
Login / Cadastro
  -> Onboarding workspace
  -> Onboarding site
  -> Escolha de caminho / briefing / estrategia
  -> Resumo
  -> Estrategias sugeridas
  -> Dashboard
```

O backend real ainda exige workspace, site e briefing minimo antes de liberar `/dashboard`.

---

## Telas canonicas

| Tela | Intencao |
|---|---|
| `/dashboard` | saude operacional e proximas acoes |
| `/dashboard/blog` | canal de publicacao e customizacao |
| `/dashboard/estrategias` | gestao multi-estrategia |
| `/dashboard/estrategias/nova` | criacao guiada de estrategia |
| `/dashboard/estrategias/[id]` | detalhe e refinamento de estrategia |
| `/dashboard/artigos` | producao editorial e fila |
| `/dashboard/calendario` | agenda editorial |
| `/dashboard/tendencias` | oportunidades |
| `/dashboard/analytics` | performance SEO/GEO |
| `/dashboard/newsletter` | relacionamento recorrente |
| `/dashboard/leads` | captura e gestão de contatos |
| `/dashboard/configuracoes` | configuracao unificada |
| `/blog` e `/blog/[slug]` | experiencia publica |

---

## Regras de UX obrigatorias

- o prototipo prevalece sobre UI antiga
- o backend deve ser adaptado por adapters quando necessario
- mocks sao temporarios e nao viram verdade funcional
- dados reais substituem mocks sem mudar a composicao visual
- rotas legadas existem apenas para compatibilidade
- `Aprovacoes`, `Jobs` e telas antigas nao voltam para a nav principal sem novo prototipo

---

## Historico

| Versao | Data | Mudanca |
|---|---|---|
| 2.0 | 2026-04-16 | `prototipo-visual/` promovido a fonte de verdade |
| 4.0 | 2026-04-20 | novo commit do prototipo aplicado: design system, blog publico, estrategias, calendario, newsletter e leads |
