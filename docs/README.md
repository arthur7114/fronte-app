# Micro SaaS SEO + GEO - Documentacao

Este diretorio organiza os documentos canonicos do produto, arquitetura e execucao.

## Fontes de verdade

- Front e UX: `prototipo-visual/`
- Design system: `prototipo-visual/design-system/` e `prototipo-visual/app/globals.css`
- Estado implementado: `docs/13-current-state-audit.md`
- Roadmap vivo: `docs/12-execution-roadmap.md`

Qualquer mudanca em tela, rota, fluxo, componente ou token deve partir do prototipo visual e depois ser refletida no app real e nos docs.

## Ordem de leitura recomendada

1. `README.md`
2. `03-information-architecture.md`
3. `13-current-state-audit.md`
4. `14-ux-and-ia-redesign.md`
5. `12-execution-roadmap.md`
6. `04-functional-requirements.md`
7. `06-data-model-and-entities.md`

## Docs obrigatorios para tela, rota ou fluxo

- `03-information-architecture.md`
- `13-current-state-audit.md`
- `14-ux-and-ia-redesign.md`

Se a mudanca afetar comportamento ou continuidade de entrega, carregar tambem:

- `04-functional-requirements.md`
- `12-execution-roadmap.md`

## Estrutura

- `00-overview.md` - visao geral do produto
- `01-product-strategy.md` - problema, publico e posicionamento
- `02-mvp-scope.md` - escopo do MVP
- `03-information-architecture.md` - rotas, fluxos e telas
- `04-functional-requirements.md` - requisitos funcionais
- `05-non-functional-requirements.md` - requisitos nao funcionais
- `06-data-model-and-entities.md` - entidades e gaps de modelo
- `07-metrics-success-and-prioritization.md` - metricas e priorizacao
- `08-user-stories.md` - historias de usuario
- `09-vibecode-implementation-brief.md` - implementation brief
- `10-backlog-seeds.md` - backlog inicial
- `11-jtbd-gsd-methodology.md` - metodo operacional
- `12-execution-roadmap.md` - roadmap vivo
- `13-current-state-audit.md` - auditoria do estado real
- `14-ux-and-ia-redesign.md` - verdade de UX/IA

## Convencoes

- nao criar novo doc numerado para cada ciclo de convergencia
- atualizar docs canonicos existentes
- documentar mocks temporarios como gaps
- nao registrar uma convergencia visual como completa se ela ainda depende da UI antiga
