# Roadmap de Execucao JTBD + GSD

## Status atual

- Fase atual: `4 - Estrategia de palavras e jornada`
- Proximo passo recomendado: classificacao de keywords por prioridade, jornada e tail
- Ultima atualizacao: 2026-04-14
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

### Próximo passo esperado (Roadmap JTBD Principal)

- Fase 3: Alimentar estratégia de keywords com o briefing salvo.
- Evoluir para onboarding conversacional com IA.
