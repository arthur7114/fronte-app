# Roadmap de Execucao JTBD + GSD

## Status atual

- Fase atual: `Convergencia ao prototipo visual`
- Proximo passo recomendado: aprofundar comportamento interno das telas canonicas agora que a estrutura do produto esta alinhada ao `prototipo-visual/`
- Ultima atualizacao: 2026-04-16
- Fonte de verdade de progresso: este arquivo

---

## Como usar

Quando o usuario disser `continue de onde parou` ou `vamos para o proximo passo`, a IA deve:

1. ler `AGENTS.md`
2. ler `docs/README.md`
3. ler `docs/11-jtbd-gsd-methodology.md`
4. ler este arquivo
5. retomar pela fase atual e pelo proximo passo recomendado
6. atualizar este arquivo ao final do ciclo

---

## Fase atual - Convergencia ao prototipo visual

### Job

Quando ja existe uma base funcional, mas a verdade do produto mudou,
eu quero que o app real converja para o prototipo visual sem apego a rotas e UX antigas,
para que a experiencia entregue no produto siga a estrategia atual do negocio.

### Entregas deste ciclo

- promocao do `prototipo-visual/` a fonte de verdade para fluxo e navegacao
- rotas canonicas novas:
  - `/login`
  - `/cadastro`
  - `/onboarding`
  - `/onboarding/site`
  - `/onboarding/briefing`
  - `/dashboard`
  - `/dashboard/blog`
  - `/dashboard/estrategia`
  - `/dashboard/estrategia/[id]`
  - `/dashboard/plano`
  - `/dashboard/artigos`
  - `/dashboard/tendencias`
  - `/dashboard/analytics`
  - `/dashboard/configuracoes`
- onboarding quebrado em 3 passos persistidos
- shell unica do dashboard com navegacao reorganizada
- estrategias mantidas como multi-strategy via cards + detalhe
- unificacao de keywords, topics e calendario em `Plano de Conteudo`
- unificacao de configuracoes em uma unica pagina
- sincronizacao de `docs/` com a nova verdade de produto

### Criterios de aceite

- usuario autenticado entra por `/dashboard`
- onboarding cria `tenant`, `membership`, `site` e `business_briefing` em 3 passos
- rotas antigas com equivalente redirecionam para o espaco canonico
- `Aprovacoes` e `Jobs` deixam de aparecer na navegacao principal
- `docs/03`, `docs/13`, `docs/14` e `docs/README.md` ficam coerentes entre si

### Progresso

- [x] definir o prototipo visual como fonte de verdade
- [x] convergir rotas de auth para `/login` e `/cadastro`
- [x] criar onboarding em 3 passos reais
- [x] criar shell canonica em `/dashboard/*`
- [x] migrar Dashboard, Estrategia, Plano, Artigos, Blog, Tendencias, Analytics e Configuracoes
- [x] manter compatibilidade via redirects para rotas legadas
- [x] sincronizar docs com a nova arquitetura de experiencia

---

## Proximo passo recomendado

Depois da convergencia estrutural, o proximo ciclo deve aprofundar a experiencia interna das telas canonicas com base no prototipo, sem reabrir a discussao de topologia.

Prioridade sugerida:

1. refinar `dashboard/estrategia/[id]` para aproximar a densidade conversacional e de resumo lateral do prototipo
2. aprofundar `dashboard/blog` em template e customizacao real
3. redistribuir completamente as responsabilidades de `Aprovacoes` e `Jobs` para encerrar o legado visivel
4. melhorar `dashboard/analytics` e `dashboard/tendencias` conforme novas integracoes reais forem entrando

---

## Registro desta atualizacao

### 2026-04-16

- `prototipo-visual/` foi declarado fonte de verdade para fluxo, navegacao e estrutura de experiencia
- rotas canonicas foram promovidas para `/login`, `/cadastro`, `/onboarding/*` e `/dashboard/*`
- a shell autenticada foi reorganizada para o fluxo do prototipo
- `Plano de Conteudo` foi consolidado como pagina unica com `keywords`, `topics` e `calendar`
- `Configuracoes` foi consolidado como pagina unica com secoes internas
- `docs/README.md`, `03-information-architecture.md`, `04-functional-requirements.md`, `06-data-model-and-entities.md`, `13-current-state-audit.md` e `14-ux-and-ia-redesign.md` foram sincronizados com a nova verdade de produto

### Validacao registrada

- `npx tsc -p apps/web/tsconfig.json --noEmit` passou
- `npm --workspace @super/web run lint` segue falhando por baseline legado fora do escopo
