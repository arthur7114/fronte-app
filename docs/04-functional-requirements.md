# Requisitos Funcionais

## 1. Autenticacao e acesso

- o sistema deve oferecer rotas canonicas `/login` e `/cadastro`
- o sistema deve redirecionar usuarios autenticados para `/dashboard` ou `/onboarding`, conforme o estado do workspace
- o sistema deve manter compatibilidade temporaria com rotas legadas via redirect

## 2. Onboarding

- o sistema deve executar onboarding em 3 passos reais:
  - `/onboarding` cria `tenant` e `membership`
  - `/onboarding/site` cria o primeiro `site`
  - `/onboarding/briefing` cria ou completa `business_briefings`
- o sistema deve persistir progresso entre as etapas
- o sistema deve impedir acesso ao dashboard principal antes da conclusao minima do onboarding

## 3. Dashboard

- o sistema deve exibir uma visao inicial de saude do workspace
- o sistema deve destacar proximas acoes do fluxo de conteudo
- o sistema deve oferecer atalhos para `Plano de Conteudo` e `Artigos`

## 4. Estrategia

- o sistema deve manter suporte a multiplas estrategias por projeto
- o sistema deve listar estrategias em `/dashboard/estrategia`
- o sistema deve abrir o detalhe de cada estrategia em `/dashboard/estrategia/[id]`
- o sistema deve permitir criar estrategia nova sem sair do contexto do dashboard

## 5. Plano de Conteudo

- o sistema deve unificar keywords, topics e calendario em `/dashboard/plano`
- o sistema deve aceitar visao global e filtro opcional por `strategy`
- o sistema deve expor as abas canonicas `keywords`, `topics` e `calendar`

## 6. Artigos

- o sistema deve centralizar producao editorial em `/dashboard/artigos`
- o sistema deve permitir criar artigo em `/dashboard/artigos/novo`
- o sistema deve permitir editar artigo em `/dashboard/artigos/[id]`
- o sistema deve manter a lista de artigos baseada em dados reais

## 7. Meu Blog

- o sistema deve concentrar preview e configuracao do site em `/dashboard/blog`
- o sistema deve reutilizar a configuracao real do `site`
- o sistema nao deve introduzir CMS ficticio ou dados mockados como verdade funcional

## 8. Tendencias

- o sistema deve disponibilizar a tela de tendencias em `/dashboard/tendencias`
- quando dados ainda nao existirem, a tela deve usar estado vazio ou indisponivel coerente

## 9. Analytics

- o sistema deve disponibilizar a tela de analytics em `/dashboard/analytics`
- o sistema deve priorizar leitura de dados reais
- metricas nao integradas devem aparecer como indisponiveis, nao simuladas

## 10. Configuracoes

- o sistema deve oferecer uma unica pagina de configuracoes em `/dashboard/configuracoes`
- a pagina deve organizar as secoes:
  - `account`
  - `workspace`
  - `site`
  - `automation`
  - `ai`
- as subrotas antigas de configuracao devem redirecionar para a pagina unica com `query param`

## 11. Politica de dados

- o sistema deve priorizar reutilizacao de contratos e APIs existentes quando compativeis com o prototipo
- o sistema deve preferir dados reais a mocks
- na ausencia de dados ou integracoes, o sistema deve usar empty states ou estados de indisponibilidade explicitos

## 12. Politica de compatibilidade de rotas

- rotas `/auth/*` e `/app/*` com equivalente funcional devem existir apenas como compatibilidade
- as rotas canonicas do produto passam a ser `/login`, `/cadastro`, `/onboarding/*` e `/dashboard/*`
- `Aprovacoes` e `Jobs` nao devem aparecer na navegacao principal

## 13. Briefing e estrategia

- o briefing de negocio deve continuar alimentando a camada estrategica
- a estrategia deve usar o contexto do briefing sempre que isso nao contradizer o prototipo
- a pagina de estrategia detalhada deve manter coerencia com a intencao visual do prototipo, mesmo quando o comportamento interno exigir adaptacao
