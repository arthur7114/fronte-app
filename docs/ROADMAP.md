# Product Roadmap

## Visão geral

O produto completo evolui em fases, mas o foco atual ainda é fechar o MVP com qualidade operacional.

Hoje o projeto já avançou bem nas fases de base, blog e automação inicial. O próximo trabalho deve priorizar fechamento de escopo antes de expansão.

---

## Fase 1 — Foundation e acesso

Objetivo:

criar a base operacional do produto

Status atual:

praticamente concluída

Entregas já cobertas:

- auth
- sessão SSR
- workspace
- onboarding
- shell autenticado do app

---

## Fase 2 — Blog Engine e CMS

Objetivo:

entregar a estrutura editorial mínima do produto

Status atual:

praticamente concluída

Entregas já cobertas:

- site/blog
- posts
- editor básico
- fluxo editorial
- blog público

---

## Fase 3 — AI Content Production

Objetivo:

automatizar pesquisa, planejamento e escrita

Status atual:

parcialmente concluída, com o núcleo já funcional

Entregas já cobertas:

- topic research
- aprovação humana
- briefs
- draft generation
- jobs reais por tenant

Pendências principais:

- `publish_post`
- UI de `ai_rules`
- melhor observabilidade
- decisão final sobre exposição de `modelo` na UI

---

## Fase 4 — Governança de consumo de IA

Objetivo:

transformar a IA em capability comercial controlada pela plataforma

Direção:

- IA vendida pela plataforma
- sem BYO key no MVP
- modelo como variável de qualidade e custo
- introdução de sistemática de créditos

Entregas possíveis:

- seleção de modelo
- medição de consumo por operação
- saldo e histórico de créditos
- limites por plano

---

## Fase 5 — Results Analysis

Objetivo:

mostrar o impacto do conteúdo publicado

Entregas possíveis:

- métricas por post
- tráfego
- CTR
- ranking
- performance dashboard

---

## Fase 6 — Contact Base e automações

Objetivo:

expandir o produto além do blog engine

Entregas possíveis:

- contatos
- origem e status básico
- integrações externas
- automações por evento
- webhooks e sequências futuras

---

## Próximo foco recomendado

Antes de abrir novas frentes grandes, o roadmap imediato deve priorizar:

- fechar o restante do escopo do MVP
- endurecer operação de jobs e IA
- preparar a camada de consumo por modelo/créditos

O produto já deixou de ser apenas uma promessa técnica. Agora o trabalho mais valioso é transformar o núcleo já funcional em operação previsível e comercializável.
