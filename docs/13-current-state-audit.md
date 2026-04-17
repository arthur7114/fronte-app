# Auditoria do Estado Atual

## Objetivo

Registrar o estado implementado apos a convergencia ao `prototipo-visual/`.

Neste ciclo, o prototipo visual deixou de ser referencia aproximada e passou a ser a fonte de verdade para:

- fluxo do usuario
- organizacao das telas
- hierarquia de elementos
- arquitetura da experiencia
- navegacao principal
- intencao de uso de cada etapa

Este documento compara a base real com essa verdade de produto e registra o que foi mantido, adaptado, refeito e retirado da UX principal.

---

## Resumo executivo

O app agora converge estruturalmente para o fluxo do prototipo:

1. autenticacao em `/login` e `/cadastro`
2. onboarding em 3 passos: `/onboarding`, `/onboarding/site`, `/onboarding/briefing`
3. area autenticada unificada em `/dashboard/*`
4. modulos principais do produto dentro de uma unica shell:
   - Dashboard
   - Meu Blog
   - Estrategia
   - Plano de Conteudo
   - Artigos
   - Tendencias
   - Analytics
   - Configuracoes

O principal ganho deste ciclo nao foi backend novo. Foi reorganizacao de UX, rotas e arquitetura de experiencia em cima da base real ja existente.

---

## Fluxo principal identificado e implementado

### Fluxo canonico atual

```text
/login ou /cadastro
  -> /onboarding
  -> /onboarding/site
  -> /onboarding/briefing
  -> /dashboard
  -> modulos recorrentes do produto em /dashboard/*
```

### Intencao de cada etapa

| Etapa | Intencao |
|------|----------|
| `/login` | acesso rapido para quem ja tem conta |
| `/cadastro` | ativacao inicial |
| `/onboarding` | criar workspace (`tenant` + `membership`) |
| `/onboarding/site` | criar o primeiro site real |
| `/onboarding/briefing` | capturar contexto do negocio |
| `/dashboard` | mostrar saude do ciclo e proxima acao |
| `/dashboard/estrategia` | listar estrategias existentes |
| `/dashboard/estrategia/[id]` | operar uma estrategia especifica |
| `/dashboard/plano` | unificar keywords, topics e calendario |
| `/dashboard/artigos` | operar producao editorial global |
| `/dashboard/blog` | ver e configurar o canal de publicacao |
| `/dashboard/tendencias` | explorar oportunidades externas |
| `/dashboard/analytics` | ler resultado agregado |
| `/dashboard/configuracoes` | centralizar configuracoes do workspace |

### Regras implicitas preservadas

- existe uma navegacao principal unica
- configuracao e operacao vivem dentro do dashboard
- o app apresenta o produto por fluxo, nao por arquitetura interna antiga
- dados reais sao priorizados; quando algo ainda nao existe, a UX mostra estado vazio ou indisponivel

---

## Matriz explicita de reaproveitamento

### Reaproveitado sem alteracao estrutural

- autenticacao e sessao via Supabase
- entidades `tenants`, `sites`, `business_briefings`, `keyword_candidates`, `topic_candidates`, `strategies`, `posts`
- loaders e actions de briefing, site, estrategia e posts
- primitives de UI e tokens globais
- componentes dinamicos do dashboard que ja operavam com dados reais

### Reaproveitado com adaptacao

- `AuthForm` e shells de auth para as rotas canonicas `/login` e `/cadastro`
- onboarding antigo para o fluxo em 3 passos reais
- `AppShell` para se tornar a shell canonica de `/dashboard`
- `StrategySelector` como landing de cards de estrategia
- `PostsBoard` e editor como base de `Artigos`
- paines de configuracao existentes como secoes internas da pagina unica de `Configuracoes`
- paginas de `Analytics` e `Tendencias` com hierarquia do prototipo e dados atuais

### Refeito

- topologia principal de rotas
- navegacao principal do produto
- pagina detalhada de estrategia em `/dashboard/estrategia/[id]`
- pagina unificada de plano em `/dashboard/plano`
- pagina de blog em `/dashboard/blog`
- pagina unica de configuracoes em `/dashboard/configuracoes`

### Retirado da UX principal

- `Aprovacoes` na sidebar
- `Jobs` na sidebar
- `Perfil do Negocio` como item principal de navegacao
- subrotas de configuracoes como experiencia principal
- `/auth/*` e `/app/*` como caminhos canonicos de produto

---

## Compatibilidade de rotas

### Rotas canonicas

```text
/login
/cadastro
/onboarding
/onboarding/site
/onboarding/briefing
/dashboard
/dashboard/blog
/dashboard/estrategia
/dashboard/estrategia/[id]
/dashboard/plano
/dashboard/artigos
/dashboard/artigos/novo
/dashboard/artigos/[id]
/dashboard/tendencias
/dashboard/analytics
/dashboard/configuracoes
```

### Redirects de compatibilidade

| Rota legada | Destino canonico |
|------------|------------------|
| `/auth/login` | `/login` |
| `/auth/signup` | `/cadastro` |
| `/app` | `/dashboard` |
| `/app/dashboard` | `/dashboard` |
| `/app/blog` | `/dashboard/blog` |
| `/app/estrategias` | `/dashboard/estrategia` |
| `/app/estrategias/[id]` | `/dashboard/estrategia/[id]` |
| `/app/estrategias/[id]/overview` | `/dashboard/estrategia/[id]` |
| `/app/estrategias/[id]/keywords` | `/dashboard/plano?strategy=<id>&tab=keywords` |
| `/app/estrategias/[id]/temas` | `/dashboard/plano?strategy=<id>&tab=topics` |
| `/app/estrategias/[id]/artigos` | `/dashboard/artigos?strategy=<id>` |
| `/app/configuracoes` | `/dashboard/configuracoes` |
| `/app/configuracoes/account` | `/dashboard/configuracoes?section=account` |
| `/app/configuracoes/workspace` | `/dashboard/configuracoes?section=workspace` |
| `/app/configuracoes/site` | `/dashboard/configuracoes?section=site` |
| `/app/configuracoes/automation` | `/dashboard/configuracoes?section=automation` |
| `/app/configuracoes/ai` | `/dashboard/configuracoes?section=ai` |
| `/app/artigos` | `/dashboard/artigos` |
| `/app/artigos/new` | `/dashboard/artigos/novo` |
| `/app/artigos/[id]` | `/dashboard/artigos/[id]` |
| `/app/analytics` | `/dashboard/analytics` |
| `/app/tendencias` | `/dashboard/tendencias` |
| `/app/perfil` | `/dashboard/estrategia` |

### Rotas legadas mantidas sem destaque na navegacao

- `/app/aprovacoes`
- `/app/jobs`

Estas rotas continuam acessiveis por URL direta enquanto suas acoes sao redistribuidas entre Dashboard, Plano e Artigos.

---

## Mapeamento entre prototipo e base atual

| Tela do prototipo | Estado atual na base |
|-------------------|----------------------|
| Login | implementado em rota canonica |
| Cadastro | implementado em rota canonica |
| Onboarding workspace | implementado |
| Onboarding site | implementado |
| Onboarding briefing | implementado |
| Dashboard | implementado com dados reais |
| Estrategia lista | implementado com cards |
| Estrategia detalhe | implementado em formato detalhado com resumo lateral |
| Plano | implementado como unificacao de keywords, topics e calendario |
| Artigos | implementado com board e editor reais |
| Blog | implementado com preview + configuracao real do site |
| Tendencias | implementado com dados atuais e estados vazios quando necessario |
| Analytics | implementado com dados atuais e estados vazios quando necessario |
| Configuracoes | implementado como pagina unica com secoes internas |

---

## Gaps tecnicos ainda existentes

Os gaps remanescentes agora sao de profundidade funcional, nao de alinhamento estrutural.

### UX e produto

- a pagina detalhada de estrategia ainda nao reproduz toda a densidade do prototipo em formato conversacional
- `Aprovacoes` e `Jobs` ainda existem como legado acessivel por URL
- `Blog` ainda nao cobre toda a camada de template/customizacao desenhada no prototipo

### Dados e modelo

- `posts` continuam globais nesta fase; o filtro por estrategia e apenas de UX quando aplicavel
- nao foi introduzido vinculo obrigatorio de banco entre `posts` e `strategy_id` neste ciclo
- metricas avancadas de analytics continuam dependentes de integracoes futuras

### Qualidade tecnica

- `npx tsc -p apps/web/tsconfig.json --noEmit` passa
- `npm --workspace @super/web run lint` continua falhando por problemas preexistentes fora do escopo desta migracao

---

## Validacao registrada

- leitura completa do `prototipo-visual/` como fonte de verdade de fluxo e navegacao
- migracao de rotas principais para o espaco canonico `/dashboard/*`
- reestruturacao do onboarding em 3 passos persistidos
- reaproveitamento de backend, actions e loaders compativeis
- sincronizacao da documentacao canonica com a nova verdade de produto

### Checks executados

- `npx tsc -p apps/web/tsconfig.json --noEmit` -> passou
- `npm --workspace @super/web run lint` -> falha por baseline legado de lint

Nao houve mudanca de schema ou migracao de banco neste ciclo.
