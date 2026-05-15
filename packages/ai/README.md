# @super/ai

Engine de workflows AI do fronte-app. Construído sobre **Mastra** (`@mastra/core`) para
suportar o pipeline de criação de artigos em três modos:

- **manual** — humano aprova em todos os gates
- **assisted** — auto-encadeia até draft; humano revisa antes de publicar
- **automatic** — workflow completo sem intervenção; cai em HITL se `quality_score < threshold`

## Estrutura

```
src/
  index.ts                 # re-exports públicos
  mastra/
    index.ts               # instância Mastra (agents + workflows + storage + logger)
    agents/
      seo-researcher.ts    # fase 1: research
      content-strategist.ts# fase 2: structure (brief)
      article-writer.ts    # fase 3: write (markdown)
      quality-reviewer.ts  # fase 4: review (scores + final_content)
    tools/
      serper.ts            # SERP scraping (Serper.dev)
      dataforseo.ts        # search volume / difficulty
      supabase.ts          # leitura/escrita em article_generations + posts
    workflows/
      create-article.ts    # workflow de 5 steps com suspend gates condicionais
```

## Workflow `createArticleWorkflow`

Steps em ordem (research → structure → write → review → schedule). Cada step:

1. Lê estado atual de `article_generations` no Supabase
2. Pula o trabalho se já tem resultado persistido (idempotente em resume)
3. Senão chama o agent correspondente
4. Persiste resultado em `article_generations` + `posts`
5. Faz `suspend()` se o `operationMode` exigir aprovação naquele gate
6. Aplica `resumeData.edits` quando o humano altera título/meta/conteúdo
7. Se `resumeData.approved === false`, refaz o step com `rejectReason` injetado como
   negative example no próximo prompt

### Gates por modo

| Gate          | manual | assisted | automatic |
|---------------|--------|----------|-----------|
| after research| ✓      | —        | —         |
| after structure| ✓     | ✓        | —         |
| after review  | ✓      | ✓        | só se score < threshold |

## Integração com Next.js (apps/web)

```ts
// apps/web/src/lib/mastra.ts
import { mastra } from "@super/ai";

// Start workflow
const workflow = mastra.getWorkflow("createArticleWorkflow");
const run = await workflow.createRunAsync();
void run.start({ inputData: { ...} });

// Resume after human approves a gate
const run = await workflow.createRunAsync({ runId });
void run.resume({ step: "review", resumeData: { approved: true, edits: {...} } });
```

APIs REST expostas pelo apps/web:

- `POST /api/workflow/start` — kicks off um run, retorna `runId` + modo resolvido pela strategy
- `POST /api/workflow/resume` — body: `{ runId, stepId, approved, rejectReason?, edits? }`
- `GET  /api/workflow/status?runId=...` — snapshot do run para polling

## Variáveis de ambiente

```bash
OPENAI_API_KEY=sk-...            # obrigatória
MASTRA_DEFAULT_MODEL=gpt-4o-mini # opcional, fallback
MASTRA_STORAGE_URL=file:./mastra.db   # ou libsql://... ou postgres://... (ver abaixo)
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SERPER_API_KEY=...   # opcional
DATAFORSEO_LOGIN=... # opcional
DATAFORSEO_PASSWORD=...
```

## Storage

MVP usa **LibSQL** local (`file:./mastra.db`). Funciona para single-instance worker e
desenvolvimento. Para produção multi-instance, trocar para `@mastra/pg` apontando para
o Supabase Postgres — Mastra cria automaticamente as tabelas de workflow_runs/snapshots.

```ts
// alternativa em packages/ai/src/mastra/index.ts
import { PostgresStore } from "@mastra/pg";
const storage = new PostgresStore({ connectionString: process.env.DATABASE_URL });
```

## Migração a partir do código anterior

- `apps/web/src/lib/article-agent.ts` (runResearchPhase, runStructurePhase, runWritePhase,
  runReviewPhase) → agora vivem como **steps** do workflow `createArticle`
- `apps/web/src/app/api/article-agent/route.ts` → continua funcionando como adapter
  síncrono (mantido durante transição), mas `/api/workflow/start` é o caminho oficial
- Prompts em `apps/worker/src/prompts.ts` → migrados para `instructions` dos agents
- Auto-aprovação implícita de brief no worker (`processor.ts` ~linha 560) → **a remover**
  na próxima iteração quando o worker virar dispatcher de Mastra

## Typecheck

Mastra v1.x tem tipos pesados — typecheck local exige heap maior:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npx tsc --noEmit
```
