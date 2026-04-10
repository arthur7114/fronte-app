# Micro SaaS SEO + GEO — Documentação

Este diretório organiza o PRD original em arquivos menores, com foco em:
- navegação rápida no VS Code
- melhor recuperação de contexto por agentes como Codex
- separação entre visão, escopo, requisitos e execução

## Estrutura

- `00-overview.md` — visão geral do produto
- `01-product-strategy.md` — problema, público, posicionamento, proposta de valor e princípios
- `02-mvp-scope.md` — escopo do MVP, fora de escopo, GEO e planos
- `03-information-architecture.md` — navegação, telas e fluxos principais
- `04-functional-requirements.md` — requisitos funcionais
- `05-non-functional-requirements.md` — requisitos não funcionais, integrações, riscos e premissas
- `06-data-model-and-entities.md` — entidades principais do sistema
- `07-metrics-success-and-prioritization.md` — métricas, critérios de sucesso, aceite e priorização
- `08-user-stories.md` — user stories por módulo
- `09-vibecode-implementation-brief.md` — prompt-base e direcionamento para ferramenta de construção
- `10-backlog-seeds.md` — backlog inicial sugerido por épicos
- `11-jtbd-gsd-methodology.md` — metodologia de execução com Jobs To Be Done e Get Shit Done
- `12-execution-roadmap.md` — plano vivo de fases, progresso e próximo passo
- `13-current-state-audit.md` — auditoria do código atual contra o MVP e próxima entrega recomendada

## Como usar com Codex

1. Comece pelo `README.md`.
2. Depois carregue `11-jtbd-gsd-methodology.md` e `12-execution-roadmap.md`.
3. Para contexto geral, carregue `00-overview.md` e `09-vibecode-implementation-brief.md`.
4. Para implementação:
   - produto e decisões: `01-product-strategy.md`
   - escopo: `02-mvp-scope.md`
   - telas e fluxos: `03-information-architecture.md`
   - regras: `04-functional-requirements.md`
   - restrições técnicas: `05-non-functional-requirements.md`
   - entidades: `06-data-model-and-entities.md`
   - backlog e próximas entregas: `10-backlog-seeds.md`
   - metodologia e retomada: `11-jtbd-gsd-methodology.md`
   - plano vivo e próximo passo: `12-execution-roadmap.md`
   - estado atual do app: `13-current-state-audit.md`

## Convenções

- Arquivos numerados para manter ordem lógica.
- Títulos curtos e previsíveis.
- Conteúdo duplicado minimizado.
- Decisões de produto separadas de requisitos, para facilitar evolução do projeto.

## Fluxo continuo com IA

- Antes de editar qualquer doc, leia `AGENTS.md` e depois este arquivo.
- Para alteracoes de produto, atualize primeiro o doc numerado afetado e depois este indice.
- Se criar um novo doc numerado, inclua-o aqui na ordem correta no mesmo movimento.
- Se um doc legado ainda for util, mantenha-o fora do fluxo principal de leitura.
- Para continuar desenvolvimento, diga `continue de onde parou` ou `vamos para o proximo passo`.
