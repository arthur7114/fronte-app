# CLAUDE.md

> Leia este arquivo antes de qualquer ação. É a fonte de verdade operacional para este workspace.

---

## Produto

Micro SaaS PLG de SEO + GEO para pequenos negócios e usuários leigos. Transforma um briefing simples em operação quase automatizada de conteúdo: criação de blog, estratégia de palavras-chave, plano editorial, geração de artigos com IA, publicação e analytics de tráfego/performance.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js (App Router) + React 19 |
| Linguagem | TypeScript 5.7 |
| Estilização | Tailwind CSS v4 |
| UI Components | Radix UI + design system próprio |
| Banco de dados | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| IA | OpenAI (gpt-4o-mini padrão) |
| Analytics | Google Analytics 4 API |
| Monorepo | Turborepo + npm workspaces |
| Deploy | Docker (web + worker) |

### Workspaces

```
apps/web          → Next.js app principal
apps/worker       → Worker de background (jobs assíncronos)
packages/db       → Cliente Supabase + tipos TypeScript
packages/shared   → Constantes compartilhadas
packages/strategy-mcp → Servidor MCP de estratégia
```

---

## Fontes de verdade

| O quê | Onde |
|---|---|
| Layout, hierarquia, navegação e estados visuais | `prototipo-visual/` |
| Tokens, tipografia, cores, radius e componentes | `prototipo-visual/design-system/` e `prototipo-visual/app/globals.css` |
| Arquitetura de rotas e fluxos | `docs/03-information-architecture.md` |
| Estado atual da implementação | `docs/13-current-state-audit.md` |
| Próximos passos priorizados | `docs/12-execution-roadmap.md` |
| Entidades e schema do banco | `docs/06-data-model-and-entities.md` |
| Regras de agentes e skills | `.agent/rules/GEMINI.md` |
| Arquitetura do sistema de agentes | `.agent/ARCHITECTURE.md` |

> **Regra absoluta de design:** Nunca divergir de `prototipo-visual/design-system`. Antes de qualquer trabalho visual, leia `prototipo-visual/design-system/README.md`.

---

## Rotas canônicas

```
/login  /cadastro
/onboarding  /onboarding/site  /onboarding/briefing
/onboarding/escolher  /onboarding/estrategia  /onboarding/resumo  /onboarding/estrategias
/dashboard
  /blog  /estrategias  /estrategias/nova  /estrategias/[id]
  /artigos  /artigos/novo  /artigos/[id]
  /calendario  /tendencias  /analytics  /newsletter  /leads  /configuracoes
/blog  /blog/[slug]
/design-system
```

Redirects de compatibilidade: `/dashboard/estrategia*` → `/dashboard/estrategias*`

---

## Estado atual (2026-04-22)

**Conectado ao backend real:**
- Supabase Auth, workspace/tenant, site, briefing
- Newsletter (configs + contatos), leads, blog público por slug
- Analytics dashboard com dados reais (`analytics_daily`)
- Workflow editorial: aprovação de tópicos cria rascunhos em `posts`

**Com mock/adapters temporários:**
- Aba GEO do Analytics (aguarda GA4 Data API)
- Estratégias visuais do protótipo

**Próximo passo prioritário (Fase 1):**
Conectar UI ↔ Worker nos jobs reais (`research_topics`, `generate_brief`, `generate_post`) e injetar contexto da estratégia nos prompts de IA.

---

## Sistema de agentes (.agent/)

Este projeto usa o **Antigravity Kit** — 20 agentes especialistas, 37 skills, 13 workflows.

### Protocolo obrigatório antes de qualquer código

1. Identificar o domínio da tarefa
2. Selecionar o agente adequado da tabela abaixo
3. Ler o arquivo `.agent/agents/{agente}.md`
4. Carregar as skills listadas no frontmatter do agente
5. Aplicar as regras antes de escrever qualquer linha

### Roteamento de agentes por domínio

| Domínio | Agente | Skills principais |
|---|---|---|
| Web UI/UX (Next.js, React) | `frontend-specialist` | `react-best-practices`, `frontend-design`, `tailwind-patterns` |
| API / lógica de negócio | `backend-specialist` | `api-patterns`, `nodejs-best-practices`, `database-design` |
| Schema / SQL | `database-architect` | `database-design` |
| CI/CD / Docker | `devops-engineer` | `deployment-procedures`, `docker-expert` |
| Segurança | `security-auditor` | `vulnerability-scanner` |
| Testes | `test-engineer` | `testing-patterns`, `webapp-testing` |
| Debug | `debugger` | `systematic-debugging` |
| Planejamento / discovery | `project-planner` | `brainstorming`, `plan-writing` |
| SEO / GEO | `seo-specialist` | `seo-fundamentals`, `geo-fundamentals` |
| Multi-domínio | `orchestrator` | `parallel-agents`, `behavioral-modes` |

### Workflows disponíveis (slash commands)

`/brainstorm` `/create` `/debug` `/deploy` `/enhance` `/execute-next` `/orchestrate` `/plan` `/preview` `/status` `/test` `/ui-ux-pro-max`

---

## Regras de conduta

### Antes de qualquer implementação

1. Classifique o tipo de request (pergunta / survey / código simples / código complexo / design)
2. Para requests complexas: aplique o **Socratic Gate** — faça ao menos 3 perguntas estratégicas antes de codificar
3. Nunca assuma o que está implícito; se 1% está nebuloso, pergunte

### Ao modificar arquivos

- Verifique dependências antes de alterar qualquer arquivo
- Atualize todos os arquivos afetados juntos
- Mocks temporários são aceitáveis quando documentados; dados reais substituem mocks progressivamente sem alterar a composição visual

### Checklist de validação (antes de marcar tarefa como concluída)

```bash
npx tsc -p apps/web/tsconfig.json --noEmit
npm --workspace @super/web run build
npm --workspace @super/web run lint
python .agent/scripts/checklist.py .
```

Ordem de prioridade de correção: **Security → Lint → Schema → Tests → UX → SEO → Lighthouse/E2E**

### Idioma

- Responder no idioma do usuário (português)
- Código, variáveis e comentários em inglês
