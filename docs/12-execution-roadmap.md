# Roadmap de Execucao JTBD + GSD

## Status atual

- Fase atual: `5 - Plano editorial`
- Proximo passo recomendado: Gerar temas de conteúdo (pautas) baseados nas keywords aprovadas
- Ultima atualizacao: 2026-04-14 (Refined)
- Fonte de verdade de progresso: este arquivo

---

## Como usar

Quando o usuario disser `continue de onde parou` ou `vamos para o proximo passo`, a IA deve:

1. Ler `AGENTS.md`
2. Ler `docs/README.md`
3. Ler `docs/11-jtbd-gsd-methodology.md`
4. Ler este arquivo
5. Retomar pela fase atual e pelo proximo passo recomendado
6. Atualizar este arquivo ao final do ciclo

---

## Fase 0 - Fundacao operacional

### Job

Quando estou desenvolvendo com IA,
eu quero que o projeto tenha uma memoria operacional clara,
para conseguir continuar sem repetir contexto e sem perder decisoes.

### Entregas

- docs canonicos numerados
- `AGENTS.md` como entrada operacional
- workflows de manutencao e retomada
- roadmap vivo com fases, progresso e proximo passo

### Criterio de aceite

- `docs/README.md` aponta para todos os docs canonicos
- `docs/11-jtbd-gsd-methodology.md` define o metodo
- este arquivo registra fase atual, decisoes e proximo passo
- a IA consegue retomar com `continue de onde parou`

### Progresso

- [x] Canonizar docs numerados
- [x] Criar `AGENTS.md`
- [x] Criar workflow de manutencao de docs
- [x] Criar metodologia JTBD + GSD
- [x] Criar roadmap vivo
- [x] Auditar app atual contra escopo MVP

---

## Fase 1 - Ativacao inicial

### Job

Quando estou chegando no produto pela primeira vez,
eu quero criar minha conta e meu primeiro projeto sem ajuda,
para comecar a transformar meu negocio em uma estrategia organica.

### Entregas

- cadastro e login funcionando
- criacao do primeiro projeto
- onboarding inicial com estado salvo
- caminho claro ate o primeiro valor percebido

### Criterio de aceite

- usuario consegue entrar no app
- usuario consegue criar ou acessar o primeiro projeto
- sistema sabe qual projeto esta ativo
- docs de escopo e entidades refletem o comportamento implementado

---

## Fase 1.5 - Auth Premium Polish

### Job

Quando estou entrando no sistema,
eu quero sentir que estou usando uma ferramenta de elite,
para que a primeira impressao transmita confianca e autoridade tecnica.

### Entregas

- refatoracao visual radical do login e signup
- abandono de cores padrao (blue trap)
- micro-animacoes de entrada e feedback fisico
- layout assimetrico ou experimental (anti-cliche)

### Criterio de aceite

- design memoravel e autoral
- performance de carregamento instantaneo
- responsividade perfeita e acessibilidade garantida


---

## Fase 2 - Blog minimo publicavel

### Job

Quando tenho um projeto criado,
eu quero publicar um blog simples rapidamente,
para ter um lugar onde meus conteudos possam gerar descoberta organica.

### Entregas

- selecao de template
- configuracao basica do blog
- CMS proprio minimo
- listagem publica de posts
- pagina publica de post

### Criterio de aceite

- usuario consegue configurar um blog
- usuario consegue criar um post manual
- post publicado aparece publicamente
- estados de rascunho e publicado estao claros

---

## Fase 3 - Briefing com IA

### Job

Quando nao sei traduzir meu negocio em estrategia de conteudo,
eu quero responder perguntas simples guiadas por IA,
para gerar um briefing consolidado e editavel.

### Entregas

- fluxo de coleta do briefing
- consolidacao do briefing do negocio
- edicao e revisao do briefing
- persistencia por projeto

### Criterio de aceite

- briefing coleta nome, segmento, servicos, clientes, localizacao, palavras desejadas e concorrentes
- briefing fica salvo e editavel
- briefing alimenta a fase de estrategia

### Progresso

- [x] Criar entidade persistida para briefing do negocio
- [x] Criar tela de edicao em `/app/briefing`
- [x] Exibir status do briefing no overview
- [x] Alimentar estrategia de keywords com o briefing salvo
- [x] Evoluir para onboarding conversacional unificado com IA (Chat)

---

## Fase 4 - Estrategia de palavras e jornada

### Job

Quando tenho um briefing,
eu quero receber palavras e temas priorizados,
para saber onde focar sem entender SEO tecnicamente.

### Entregas

- geracao de palavras adicionais
- classificacao por prioridade
- classificacao por jornada
- classificacao short tail e long tail
- aprovacao ou edicao pelo usuario

### Criterio de aceite

- usuario entende por que cada palavra foi sugerida
- palavras aprovadas viram insumo para plano editorial
- estrategia e simples o bastante para usuario leigo

### Progresso

- [x] Migração de banco: Adicionar `difficulty`, `search_volume` e `estimated_potential`
- [x] Implementar 4 estágios da jornada (Awareness, Consideration, Evaluation, Decision)
- [x] Atualizar worker para gerar métricas SEO refinadas
- [x] Modernizar UI do painel de keywords com visualização de métricas e tabs de jornada

---

## Fase 5 - Plano editorial

### Job

Quando tenho palavras aprovadas,
eu quero receber um plano de conteudo acionavel,
para saber o que produzir por semana e por mes.

### Entregas

- transformacao de palavras em pautas
- justificativa de cada pauta
- calendario semanal
- calendario mensal
- aprovacao e edicao do plano

### Criterio de aceite

- usuario sai com proximas pautas claras
- plano pode ser editado antes de virar artigo
- cada pauta preserva relacao com palavra e etapa da jornada

---

## Fase 6 - Producao e publicacao de artigos

### Job

Quando tenho uma pauta aprovada,
eu quero gerar, revisar e publicar um artigo,
para colocar minha estrategia em movimento com pouco esforco.

### Entregas

- configuracao de estilo e tamanho
- upload de referencias
- geracao de titulo, meta description e artigo
- editor de rascunho
- aprovacao, rejeicao e publicacao

### Criterio de aceite

- usuario gera um artigo completo
- usuario consegue editar antes de publicar
- artigo publicado aparece no blog
- fluxo manual e validado antes de automacoes avancadas

---

## Fase 7 - Tendencias

### Job

Quando meu mercado muda,
eu quero receber oportunidades atuais de conteudo,
para aproveitar temas em alta no meu nicho e localizacao.

### Entregas

- analise semanal
- sinais gerais, por nicho e por localizacao
- transformacao de insight em pauta
- tela simples de oportunidades

### Criterio de aceite

- usuario entende por que uma tendencia importa
- tendencia pode virar pauta
- sugestoes respeitam contexto do projeto

---

## Fase 8 - Analytics e planos

### Job

Quando publico conteudo,
eu quero entender o que esta funcionando e meus limites de uso,
para decidir o proximo movimento e o plano certo.

### Entregas

- tracking basico
- trafego organico
- CTR
- ranking medio
- cliques em CTA
- separacao SEO e GEO
- limites por plano

### Criterio de aceite

- usuario entende performance sem leitura tecnica
- melhores e piores conteudos ficam visiveis
- limites por plano sao previsiveis

---

## Log de progresso

### 2026-04-10

- Docs canonicos foram importados para `docs/00` a `docs/10`
- Docs antigos foram removidos da pasta `docs`
- `AGENTS.md` foi criado como camada de entrada operacional
- `.agent/workflows/docs-maintenance.md` foi criado
- Metodologia JTBD + GSD foi formalizada
- Roadmap vivo foi criado
- Auditoria do estado real foi registrada em `docs/13-current-state-audit.md`
- Proxima entrega escolhida: briefing do negocio persistido por tenant/projeto
- Briefing do negocio foi implementado com tabela `business_briefings`, tela `/app/briefing` e status no overview
- Validacao executada: `npm run build` passou com a nova rota `/app/briefing`
- Validacao pendente: `npm run lint` ainda falha por problemas preexistentes de configuracao/qualidade fora desta entrega
- Setup Supabase normalizado: `.env.local` criado, clients aceitam `PUBLISHABLE_KEY` e `ANON_KEY`, proxy mantem sessao atualizada

### Proximo registro esperado

- Conexao das Automações e Keywords geradas no design de "Estratégia e Automação" da UI (Fase 3 do plano Pixel Perfect).
- Validacao do fluxo com banco Supabase atualizado

### 2026-04-13

- Refatoração total para adoção de sistema visual "pixel-perfect" com base no repositório do Protótipo (Tailwind V4, Fonts Inter, Radix UI).
- `AppShell` migrado mantendo a estrutura de navegação Sidebar/Header.
- `OverviewPage` recriada com dados interativos (`kpi-cards.tsx`, `this-week.tsx`, `ai-suggestions.tsx`, `performance-highlights.tsx`) extraindo dados das chamadas de banco já existentes e orientando o painel principal ao Job to Be Done de acompanhamento com call to action para Briefing pendente.
- Fase 1 (Dashboard Top Down UX) do novo plano executivo finalizada e build TypeScript aprovado.
- Fase 2 concluída com a migração do `BusinessBriefingPanel` para usar o design de settings/briefing do protótipo, integrando os Cards, ícones Lucide e badges para um formulário de preenchimento de metadados fluído, acoplado à tipagem de server actions original.
- Fase 3 concluída: `AutomationTopicsPanel` e `AutomationBriefsPanel` refatorados para design card-based com badges de status, pills de keywords, KPI counters e integração com server actions `moderateTopicCandidate` / `enqueueDraftGeneration` preservada.
- Fase 4 concluída: `PostsBoard` migrado de tabela server-rendered estática para client component com filter tabs por status, toggle lista/grid, 3 KPI cards, badges coloridos Lucide por status, dropdown de ações por card e empty state contextual.
- Fase 5 concluída: `AutomationJobsPanel` refatorado como Torre de Controle visual com 3 KPI cards (Em execução/Falhos/Agendados), job cards com badge+ícone de status, ícone animado para jobs `running`, timestamps agrupados, highlight de erro com fundo vermelho contextual e links de entidades com `ArrowUpRight`.

### 2026-04-14

- Build Typescript do pacote `@super/web` rodado e validado com sucesso.
- Todas as refatorações da UI Pixel Perfect (`Fase 1` a `Fase 5` do escopo de modernização) committadas na branch principal.

### 2026-04-14 (Refinement)

- **Fase 4 (Keyword Strategy) Refinada**: Implementada a camada de inteligência SEO profunda.
- **Banco de Dados**: Tabela `keyword_candidates` expandida com `difficulty` (0-100), `search_volume` e `estimated_potential`.
- **Worker/IA**: Prompt de estratégia reconstruído para usar o modelo de 4 estágios da jornada do cliente e fornecer justificativas de ROI detalhadas.
- **UI/UX**: `AutomationKeywordsPanel` modernizado com barras de dificuldade coloridas, pills de volume e sistema de abas por estágio da jornada.
- **Onboarding/Root**: Eliminação da landing page legada e redirecionamento automático da raíz `/` para `/auth/login` para usuários não autenticados.

### 2026-04-14 (Dashboard & UX)

- **Redesign do Dashboard**: `AutomationOverviewPanel` refatorado para foco em ação guiada (Job to Be Done).
- **Pipeline Operacional**: Implementada visualização do fluxo Keywords -> Temas -> Briefings -> Posts com contadores em tempo real.
- **Decision Center**: Criado o card "Sugestão da IA" (Ação Prioritária) que detecta o gargalo atual da esteira e oferece o botão de ação imediata.
- **Interatividade**: Resumo do Plano Editorial agora permite acesso rápido às configurações via cliques diretos nos metadados.
- **Correção de Enfileiramento**: Resolvido erro de banco que impedia a geração de estratégias (job type constraint).

### Próximo passo esperado (Roadmap JTBD Principal)

- Fase 5: Implementação do calendário editorial visual (Calendário de Pautas).
- Integração de agendamento automático baseado na frequência configurada.

### 2026-04-14 (UX/IA Redesign — Decisão Arquitetural)

Revisão completa de UX e Arquitetura de Informação executada e aprovada pelo Product Owner.

**Decisões registradas (binding para todos os ciclos seguintes)**:

1. **Estratégia como entidade primária**: toda operação editorial pertence a uma Estratégia, não diretamente ao Projeto.
2. **Múltiplas estratégias por projeto**: o banco deve suportar 1:N entre projetos e estratégias.
3. **Separação Projeto ≠ Estratégia**: Projeto agrega (blog, conta, briefing global). Estratégia foca (keywords, temas, artigos).
4. **Dois níveis de briefing**: `business_briefings` (global, por projeto, já implementado) + `strategy_briefings` (específico, por estratégia, a implementar).
5. **strategy_id como FK obrigatório** em `keyword_candidates`, `content_topics`, `content_briefs`, `posts`.
6. **Modos de operação da IA**: Manual (padrão) / Assistido (opt-in) / Automático (opt-in explícito).
7. **Centro de Aprovação como feature core**: view cross-estratégia de tudo com `pending_review`.
8. **Terminologia padronizada na UI**: Tema (não Pauta/Topics/Briefs), Palavras-chave (não Keywords Seed), Presença em IAs (não GEO).
9. **Resultados ≠ Analytics**: Resultados = resumo por estratégia. Analytics = visão global comparativa.
10. **GEO explícito em Resultados e Analytics**: toggle SEO / GEO / Ambos.

**Docs atualizados**:
- `docs/03-information-architecture.md` — reescrito como v2.0
- `docs/06-data-model-and-entities.md` — atualizado com entidade Estratégia e strategy_id
- `docs/14-ux-and-ia-redesign.md` — criado como fonte de verdade de UX/IA (v1.1)

**Validação**: sem alteração de código neste ciclo. Ciclo foi de decisão e documentação.

---

### 2026-04-14 (Fase 5 — Entidade Estratégia — Primeiro ciclo)

**JTBD entregue**:
> Quando tenho keywords aprovadas e quero organizar diferentes focos, eu quero criar estratégias dentro do meu projeto, para não misturar linhas editoriais diferentes.

**Entregas deste ciclo**:
- `supabase/migrations/20260414_create_strategies.sql` — tabela `strategies` com RLS + `strategy_id` nullable em `keyword_candidates`, `topic_candidates`, `content_briefs`
- `packages/db/src/types.ts` — tipos sincronizados manualmente (tabela `strategies` + `strategy_id` nas 3 tabelas)
- `apps/web/src/lib/automation-data.ts` — `listStrategiesForTenant` e `getStrategyForTenant`
- `apps/web/src/app/app/automation/data.ts` — `strategies` incluído no `AutomationWorkspaceData`
- `apps/web/src/app/app/automation/actions.ts` — `createStrategy` server action
- `apps/web/src/components/strategy-selector.tsx` — componente client com criação inline de estratégia e cards de status
- `apps/web/src/app/app/automation/strategy/page.tsx` — `StrategySelector` exibido acima do painel de keywords

**Validação**: `npm run build` → Exit code 0. Zero erros TypeScript.

**Princípio preservado**: `strategy_id` é nullable — dados existentes continuam funcionando sem alteração.

---

### 2026-04-14 (Fase 5 — Ciclo 2: keywords vinculadas à estratégia)

**JTBD entregue**:
> Quando clico em "Gerar keywords" em uma estratégia específica, eu quero que as keywords geradas fiquem vinculadas àquela estratégia, para poder ver apenas as keywords da minha estratégia "SEO Local" separadas das de "Captação".

**Entregas**:
- `apps/worker/src/types.ts` — `strategy_id` adicionado ao `JobPayload`
- `apps/worker/src/processor.ts` — `processKeywordStrategy` lê `strategy_id` do payload e salva em cada `keyword_candidate`; inclui `strategy_id` no `result_json`
- `apps/web/src/lib/automation-data.ts` — `listKeywordCandidatesForTenant` aceita `strategyId?` opcional; quando presente filtra por estratégia
- `apps/web/src/app/app/automation/actions.ts` — `enqueueKeywordStrategy` lê `strategy_id` do `formData` e passa no `payload_json`
- `apps/web/src/components/strategy-selector.tsx` — refatorado com `GenerateKeywordsButton` (sub-componente com `useActionState` independente por estratégia) e `CreateStrategyForm` isolado; botão "Gerar keywords" com ícone ⚡ aparece em cada card ativo

**Validação**:
- `npm run build` (web) → Exit code 0 ✅
- `npx tsc --noEmit` (worker) → 0 erros ✅

**Retrocompatibilidade**: jobs sem `strategy_id` continuam funcionando (worker trata `null` graciosamente).

---

### 2026-04-14 (Fase 5 — Ciclo 3: filtro de keywords por estratégia na UI)

**JTBD entregue**:
> Quando estou na aba de keywords e tenho múltiplas estratégias, eu quero ver um filtro por estratégia no topo da lista, para não ver todas as keywords misturadas.

**Entregas**:
- `apps/web/src/components/automation-keywords-panel.tsx` — refatorado:
  - Removido botão "Gerar Nova Estratégia" (agora vive no `StrategySelector`)
  - Novo sub-componente `StrategyChips`: chips horizontais com contagem por estratégia + chip "Sem estratégia" para keywords sem vínculo
  - Novo sub-componente `KeywordCard`: card isolado com badge de estratégia no rodapé
  - Filtro composto: `activeStrategy × activeStage` — ambos independentes
  - Contador de keywords por journey stage visível nos chips de filtro
  - Empty state contextual quando filtros não retornam resultados
- `apps/web/src/app/app/automation/strategy/page.tsx` — passa `data.strategies` para `AutomationKeywordsPanel`

**Validação**: `npm run build` → Exit code 0 ✅

---

### 2026-04-14 (Fase 5 — Ciclo 4: `strategy_id` nos workers de tópicos e briefs)

**JTBD entregue**:
> Quando gero tópicos ou briefs a partir de uma estratégia, eu quero que essas entidades fiquem vinculadas à mesma estratégia, para manter a rastreabilidade de "essa estratégia produziu esses tópicos e esses artigos".

**Entregas** — `apps/worker/src/processor.ts`:
- `processResearchTopics`:
  - lê `strategy_id` do `payload` (null = legado)
  - escopo de keywords aprovadas filtrado por `strategy_id` quando presente → prompt mais focado
  - cada `topic_candidate` inserido recebe `strategy_id`
  - `result_json` inclui `strategy_id`
  - removido `as any` → insert usa `satisfies TablesInsert<"topic_candidates">` ✅
- `processGenerateBrief`:
  - propaga `strategy_id` do `topic_candidate` (já na DB) para o `content_brief` sem query extra
  - `result_json` inclui `strategy_id`

**Rastreabilidade completa**:
```
Estratégia → keyword_candidate.strategy_id
          → topic_candidate.strategy_id
          → content_brief.strategy_id
```

**Validação**:
- `npx tsc --noEmit` (worker, ciclo 4.1, antes do satisfies) → 0 erros ✅
- `npx tsc --noEmit` (worker, ciclo 4.2, após satisfies) → 0 erros ✅

---

### Próximo passo recomendado

**Fase 5 — Ciclo 5: action `enqueueResearchTopics` passa `strategy_id`**

JTBD:
```
Quando o usuário clica em "Gerar tópicos" dentro de uma estratégia,
eu quero que o job de tópicos seja criado com o strategy_id correto,
para que os tópicos gerados já saiam vinculados.
```

Menor entrega útil:
1. Verificar action `enqueueResearchTopics` em `actions.ts`
2. Adicionar leitura de `strategy_id` do `formData` (mesmo padrão do `enqueueKeywordStrategy`)
3. Atualizar o componente de tópicos para ter hidden input com `strategy_id` quando operando de dentro de uma estratégia

Fora deste ciclo:
- Filtro de tópicos e briefs por estratégia na UI (próxima iteração de UX)
- Centro de Aprovação multi-estratégia
- Analytics por estratégia




