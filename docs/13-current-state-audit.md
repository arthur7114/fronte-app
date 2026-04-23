# Auditoria do Estado Atual

## Objetivo

Registrar o estado real apos a transposicao do novo commit de `prototipo-visual/` para o app.

Nesta fase, `prototipo-visual/` e `prototipo-visual/design-system/` sao a fonte de verdade do front.

---

## Cobertura aplicada

### Portado visualmente

- design system e `/design-system`
- shell do dashboard
- dashboard home
- dashboard blog
- dashboard estrategias, nova estrategia e detalhe
- dashboard artigos
- dashboard calendario
- dashboard tendencias
- dashboard analytics
- dashboard newsletter
- dashboard leads
- dashboard configuracoes
- blog publico `/blog` e `/blog/[slug]`
- telas adicionais de onboarding do prototipo

### Conectado a backend real nesta fase

- Supabase Auth
- guards de dashboard
- workspace/tenant
- site
- briefing minimo de negocio
- dados reais injetados no header autenticado
- newsletter (configs e contatos)
- leads (captura e gestão)
- blog publico por slug conectado ao banco real

### Com mock/adapters temporarios

- estrategias visuais do prototipo (keywords e topics ainda com dados mock em partes da UI)
- analytics GEO (aguarda GA4 Data API)
- `generate-article-dialog.tsx` e `bulk-generate-dialog.tsx` no app real: ainda usam `setTimeout` fake — o backend real (`article-agent.ts`) existe mas não está conectado a esses dialogs

### Workflow editorial conectado parcialmente

- `article-agent.ts` + `/api/article-agent/route.ts`: implementados com 4 fases reais (research/structure/write/review), sem mocks
- `article_generations` table: migration SQL criada (`supabase/migrations/20260422_create_article_generations.sql`) mas **ainda não aplicada no Supabase live** — todos os fluxos que dependem dela falharão em runtime até aplicação
- `/dashboard/artigos/novo/client.tsx` (448 linhas): wizard page implementada sem mocks, chama o backend real via `/api/article-agent`
- Calendário: `content-calendar.tsx` reescrito com navegação real de mês (22/04)

---

## Matriz de reaproveitamento

| Categoria | Itens |
|---|---|
| Reaproveitado | Supabase Auth, `getAuthContext`, entidades centrais, actions de onboarding, guards do dashboard |
| Adaptado | shell autenticada, redirects legados, header com dados reais, rotas singulares de estrategia |
| Refeito visualmente | dashboard modules, design system, blog publico, estrategias, calendario, newsletter, leads, analytics |
| Descartado da UX principal | `/dashboard/plano` como item de nav, `/dashboard/estrategia` como rota canonica, `/blog/[subdomain]` como topologia publica principal |

---

## Rotas canonicas novas

```text
/dashboard/estrategias
/dashboard/estrategias/nova
/dashboard/estrategias/[id]
/dashboard/calendario
/dashboard/newsletter
/dashboard/leads
/blog
/blog/[slug]
/design-system
```

## Compatibilidade

- `/dashboard/estrategia` -> `/dashboard/estrategias`
- `/dashboard/estrategia/[id]` -> `/dashboard/estrategias/[id]`
- `/app/estrategias*` -> nova topologia de estrategias
- `/auth/login` -> `/login`
- `/auth/signup` -> `/cadastro`

---

## Gaps tecnicos

- `article_generations` migration criada mas nao aplicada no Supabase live — bloqueador critico para o workflow editorial
- `generate-article-dialog.tsx` e `bulk-generate-dialog.tsx` no app: ainda com `setTimeout` fake; precisam ser conectados ao `/api/article-agent`
- `article-editor.tsx`: dados hardcoded (`existingArticleData`, `generatedArticleData`); precisa consumir dados reais de `posts` + `article_generations`
- analytics GEO ainda usa estrutura visual do prototipo sem integracao completa (GA4 API pendente)
- algumas telas de onboarding usam estado de browser (`sessionStorage`) como persistencia secundaria

---

## Validacao registrada

- TypeScript passou apos a transposicao visual
- build e lint devem ser registrados no fechamento da tarefa
- nao houve mudanca de schema ou migracao de banco nesta fase
