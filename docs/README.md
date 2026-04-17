# Micro SaaS SEO + GEO - Documentacao

Este diretorio organiza os documentos canonicos do produto, da arquitetura e da execucao.

## Fonte de verdade visual atual

`prototipo-visual/` e a fonte de verdade para:

- fluxo do usuario
- organizacao das telas
- hierarquia visual
- arquitetura da experiencia
- navegacao principal

Qualquer mudanca em tela, rota, fluxo ou hierarquia deve partir do prototipo visual e depois ser refletida nos docs canonicos.

## Ordem de leitura recomendada

1. `README.md`
2. `11-jtbd-gsd-methodology.md`
3. `12-execution-roadmap.md`
4. `03-information-architecture.md`
5. `13-current-state-audit.md`
6. `14-ux-and-ia-redesign.md`

## Estrutura

- `00-overview.md` - visao geral do produto
- `01-product-strategy.md` - problema, publico, posicionamento e principios
- `02-mvp-scope.md` - escopo do MVP
- `03-information-architecture.md` - arquitetura de informacao, rotas e fluxos
- `04-functional-requirements.md` - requisitos funcionais
- `05-non-functional-requirements.md` - requisitos nao funcionais
- `06-data-model-and-entities.md` - entidades e modelo de dados
- `07-metrics-success-and-prioritization.md` - metricas e priorizacao
- `08-user-stories.md` - historias de usuario
- `09-vibecode-implementation-brief.md` - implementation brief
- `10-backlog-seeds.md` - backlog inicial
- `11-jtbd-gsd-methodology.md` - metodo operacional
- `12-execution-roadmap.md` - roadmap vivo
- `13-current-state-audit.md` - auditoria da base atual contra a verdade do produto
- `14-ux-and-ia-redesign.md` - fonte de verdade de UX e IA

## Docs obrigatorios para alteracoes de tela, rota ou fluxo

Sempre carregar estes documentos juntos:

- `03-information-architecture.md`
- `13-current-state-audit.md`
- `14-ux-and-ia-redesign.md`

Se a mudanca afetar execucao em andamento, carregar tambem:

- `12-execution-roadmap.md`

## Convencoes

- arquivos numerados mantem a ordem logica
- docs de UX e arquitetura devem refletir o prototipo visual
- docs de execucao devem refletir o estado real implementado
- nao criar novo doc numerado para registrar esta convergencia; usar os docs canonicos existentes
