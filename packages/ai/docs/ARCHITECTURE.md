# Mastra Runtime — Architecture

Pipeline de IA do fronte-app, construído sobre [Mastra](https://mastra.ai) v1.x.

## Princípios

1. **Um runtime, um motor.** Todo o trabalho de IA (research de keywords, descoberta de tópicos, briefing, escrita, revisão, publicação) passa pelo Mastra. Não há worker assíncrono, não há job queue externa.
2. **Persistência no Postgres do produto.** Mastra usa o mesmo Supabase para guardar `mastra_workflow_snapshot`. Estado de cada run sobrevive a cold starts.
3. **Human-in-the-loop nativo.** `suspend()` / `resume()` do Mastra suportam aprovação por humano em qualquer step. O modo `automatic` simplesmente nunca chama `suspend()`.
4. **Configuração gerenciável.** Modelo, tom, audiência e threshold de qualidade vêm de `strategies` (override) → `ai_preferences` (default do tenant) → env → fallback. Mudanças no painel valem na próxima run, sem redeploy.

## Camadas

```
┌────────────────────────────────────────────────────────────┐
│  apps/web (Next.js)                                         │
│  ─────────────────                                          │
│  Server Actions / Chat tools                                │
│        │                                                    │
│        ▼  triggerWorkflow(slug, inputData)                  │
│  lib/workflow-trigger.ts                                    │
│        │                                                    │
│        ▼                                                    │
│  @super/ai (este package)                                   │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│  packages/ai (Mastra)                                       │
│                                                             │
│  src/mastra/index.ts                                        │
│   ├── Storage: PostgresStore({connectionString})            │
│   ├── Logger: PinoLogger                                    │
│   ├── Agents (6)                                            │
│   │   ├─ seoResearcher                                      │
│   │   ├─ contentStrategist                                  │
│   │   ├─ articleWriter                                      │
│   │   ├─ qualityReviewer                                    │
│   │   ├─ keywordStrategist                                  │
│   │   └─ topicResearcher                                    │
│   └── Workflows (4)                                         │
│       ├─ keywordResearchWorkflow                            │
│       ├─ topicResearchWorkflow                              │
│       ├─ createArticleWorkflow                              │
│       └─ publishWorkflow                                    │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
                Supabase Postgres
                 ├─ mastra_workflow_snapshot  (Mastra state)
                 ├─ article_generations       (business state)
                 ├─ keyword_candidates
                 ├─ topic_candidates
                 ├─ content_briefs
                 ├─ posts
                 ├─ strategies                (per-strategy overrides)
                 ├─ ai_preferences            (tenant defaults)
                 └─ ai_rules                  (guardrails)
```

## Workflows

### `keywordResearchWorkflow`

Substitui o legacy `generate_keyword_strategy` do worker.

**Input**: `tenantId`, `siteId`, `strategyId`, `keywordCount` (5-60, default 20), `operationMode`.

**Steps**:
1. `generate-keywords` — carrega briefing + strategy, chama `keywordStrategist` agent, gera N keywords com volume/difficulty/intent/journey_stage. **Suspende** se `operationMode ≠ "automatic"`.
2. `persist-keywords` — upsert em `keyword_candidates` com status `suggested` (manual/assisted) ou `approved` (automatic).

### `topicResearchWorkflow`

Substitui o legacy `research_topics`.

**Input**: `tenantId`, `siteId`, `strategyId`, `topicCount` (3-30, default 10), `keywordIds` (optional), `scope` (`all_approved` / `selected` / `without_topics`).

**Steps**:
1. `generate-topics` — carrega keywords aprovadas (com filter por scope), chama `topicResearcher` agent. **Suspende** se `operationMode ≠ "automatic"`.
2. `persist-topics` — insert em `topic_candidates`.

### `createArticleWorkflow`

Substitui `generate_brief` + `generate_post` (e o antigo `lib/article-agent.ts` síncrono).

**Input**: `generationId`, `tenantId`, `postId`, `strategyId`, `topic`, `primaryKeyword`, `tone`, `targetLength`, `additionalInstructions`, `operationMode`, `qualityThreshold`.

**Steps**:
1. `research` (agent: `seoResearcher`) — gera queries + findings + competitor outlines. Suspende se `manual`.
2. `structure` (agent: `contentStrategist`) — title, meta, headings. Suspende se `manual` ou `assisted`.
3. `write` (agent: `articleWriter`) — markdown completo. Sem suspend.
4. `review` (agent: `qualityReviewer`) — SEO/readability/originality scores + final_content. **Suspende** se `manual`, `assisted`, ou (em `automatic`) `seo_score < qualityThreshold`.
5. `schedule` — flip `posts.status` para `draft` (manual/assisted) ou `scheduled` (+1h, automatic).

Idempotente em resume: cada step relê o estado de `article_generations` no DB antes de chamar o agent — não há re-chamada de OpenAI no resume.

### `publishWorkflow`

Substitui `publish_post`. Sem IA.

**Input**: `tenantId`, `postId`, `scheduledFor` (opcional).

**Steps**:
1. `validate-post` — verifica que o post existe e não está em estado terminal.
2. `persist-publish-state` — flip `posts.status` para `scheduled` (com `scheduled_for`) ou `published` (imediato).

A publicação efetiva para o CMS é feita pela Edge Function `publish-scheduled-posts` agendada via `pg_cron` (lê `posts.status='scheduled' AND scheduled_for <= NOW()`).

## Resolução de configuração

Cada agent tem um `model` dinâmico que resolve no momento da chamada:

```ts
// agents/*.ts (simplificado)
model: async ({ requestContext }) => {
  const tenantId = requestContext?.get("tenantId")
  const strategyId = requestContext?.get("strategyId")
  const model = await getModelForTenant(tenantId, strategyId)
  return openai(model)
}
```

`getModelForTenant` lê em cascata via `resolveAgentConfig` (em `tools/preferences.ts`):

1. `strategies.ai_model_override` — se setado para essa strategy
2. `ai_preferences.model` — default do tenant
3. `process.env.MASTRA_DEFAULT_MODEL` — default de sistema
4. `"gpt-4o-mini"` — hardcoded fallback

A mesma cascata vale para `tone`, `audience`, `qualityThreshold`.

## HITL via suspend/resume

Quando um step chama `await suspend(payload)`:
- O run para no step atual
- O snapshot é persistido em `mastra_workflow_snapshot`
- O caller recebe o `runId` e o `suspendPayload`

Para retomar, a UI chama `POST /api/workflow/[name]/resume` com `{runId, stepId, approved, rejectReason?, edits?}`. Mastra reativa o run, o step retoma com `resumeData` populado, e a lógica decide:
- Se `resumeData.approved === false`: refaz o trabalho com `rejectReason` injetado no prompt como negative example
- Se `resumeData.edits` presente: aplica os edits ao output e persiste
- Senão: continua para o próximo step

Esse mecanismo é independente do servidor que hospeda Mastra. Um run iniciado num Lambda pode ser resumido em outro Lambda (estado vive no Postgres).

## Storage

Resolução em ordem (em `src/mastra/index.ts`):

1. `MASTRA_STORAGE_URL` (`libsql://...` ou `postgres://...`) — wins
2. `DATABASE_URL` (postgres) — usa Supabase Postgres via `@mastra/pg`
3. LibSQL `:memory:` — fallback para testes / SSG sem env

Em produção (Vercel) usar opção 2 com Supabase. Mastra cria automaticamente as tabelas `mastra_workflow_snapshot`, `mastra_*` no primeiro `init()`.

## Trigger surfaces

Quem chama os workflows:

| Origem | Como |
|---|---|
| Server Actions em `apps/web/src/app/.../actions.ts` | `triggerWorkflow(slug, inputData)` via `lib/workflow-trigger.ts` |
| Chat assistant tools (`strategy_queue_job`) | Roteia por `job_type` para o workflow correspondente |
| API externa | `POST /api/workflow/[name]/start` |
| pg_cron (futuro, modo autônomo) | `POST /api/workflow/.../start` via cron job que dispara endpoint |

## O que NÃO está aqui

- Autônomo recorrente (`pg_cron autonomous_cycle` por strategy em modo `automatic`) — planejado, próxima sessão
- Cost tracking por strategy
- Circuit breaker (pausa modo automatic após 3 rejects seguidos)
- Memory layer (rejection reasons como contexto persistente nas próximas runs)
- Tela `/dashboard/aprovacoes` (HITL queue centralizada) — pode usar `mastra_workflow_snapshot` para listar runs suspended

## Convenções e referências

- **Conventional Commits** + co-author Claude
- **`.agent/`** = convenção de processo do Antigravity (como Claude se comporta). NÃO é runtime; não duplicar Mastra agents lá.
- `CLAUDE.md` lista esse arquivo como fonte de verdade do runtime AI.
