# Requisitos Funcionais

## 1. Autenticacao e acesso

- oferecer `/login` e `/cadastro` como rotas canonicas
- manter Supabase Auth e callbacks existentes
- redirecionar usuario autenticado conforme estado de onboarding
- manter `/auth/*` apenas como compatibilidade

## 2. Onboarding

- criar `tenant` e `membership` em `/onboarding`
- criar `site` em `/onboarding/site`
- persistir `business_briefings` em `/onboarding/briefing`
- disponibilizar as telas visuais novas do prototipo: `/onboarding/escolher`, `/onboarding/estrategia`, `/onboarding/resumo` e `/onboarding/estrategias`
- impedir entrada no dashboard sem workspace, site e briefing minimo exigido pelo backend atual

## 3. Design system

- expor `/design-system` no app real
- usar tokens do prototipo como fonte de verdade visual
- preservar `app/globals.css` como runtime dos tokens
- evitar cores literais quando houver token semantico equivalente

## 4. Dashboard e shell

- usar uma unica shell autenticada para `/dashboard/*`
- exibir sidebar com Dashboard, Meu Blog, Estrategias, Artigos, Calendario, Tendencias, Analytics, Newsletter, Leads e Configuracoes
- injetar dados reais de workspace/site/usuario no header quando disponiveis

## 5. Estrategias

- manter modelo multi-strategy
- listar estrategias em `/dashboard/estrategias`
- criar estrategia em `/dashboard/estrategias/nova`
- abrir detalhe em `/dashboard/estrategias/[id]`
- manter `/dashboard/estrategia*` como redirect de compatibilidade

## 6. Artigos e calendario

- centralizar producao editorial em `/dashboard/artigos`
- incluir fila de producao e geracao em massa conforme prototipo
- organizar agenda em `/dashboard/calendario`
- manter `/dashboard/artigos/novo` e `/dashboard/artigos/[id]` como compatibilidade quando o prototipo consolidar a experiencia na pagina principal

## 7. Blog publico e blog do dashboard

- configurar canal em `/dashboard/blog`
- expor blog publico em `/blog`
- expor artigo publico em `/blog/[slug]`
- substituir a topologia antiga `/blog/[subdomain]` nesta fase pela topologia do prototipo

## 8. Tendencias, analytics, newsletter e leads

- disponibilizar telas canonicas em `/dashboard/tendencias`, `/dashboard/analytics`, `/dashboard/newsletter` e `/dashboard/leads`
- usar mocks/adapters temporarios onde o backend ainda nao existe
- substituir mocks por dados reais sem mudar layout e hierarquia

## 9. Configuracoes
- manter `/dashboard/configuracoes` como pagina unica
- preservar redirects de subrotas antigas de configuracao
- concentrar conta, workspace, site, automacao, IA, plano e preferencias no mesmo contexto visual

## 10. Módulo de Concorrência Orgânica (SERP)
- **Captura via Serper.dev:** Integrar API externa para capturar Top 10-20 orgânico.
- **Cache Local:** Armazenar `serp_snapshots` no Supabase com expiração de 72h para economia de créditos.
- **Agregação de Domínios:** Extrair root domains da SERP e calcular *Share of Voice Orgânico* em lote (cluster de palavras-chave).
- **Injeção Ativa na IA:** Injetar títulos, snippets e PAA capturados na SERP no system prompt do Motor de Estratégia, garantindo que o output não seja "cego" ao mercado.
- **Visualização UI:** Exibir painel consolidado de concorrentes fortes na aba "Concorrência" dentro de `/dashboard/estrategias/[id]`.

## 11. Politica de dados

- priorizar dados reais quando existirem
- usar mocks apenas como ponte visual e documentar o gap
- adaptar backend por adapters quando o contrato antigo nao servir a interface do prototipo
- nao deformar a UI do prototipo para caber em implementacao legada
