# Modelo de Dados e Entidades

## Entidades principais do sistema
- Usuário
- Conta
- Projeto
- Blog
- Template de blog
- **Estratégia** (entidade primária — múltiplas por projeto)
- Briefing de negócio (global, por projeto)
- Briefing de estratégia (específico, por estratégia)
- Concorrente
- Palavra-chave
- Estágio da jornada
- Tema de conteúdo
- Artigo
- Referência
- Insight de tendência
- Evento de tracking
- Métrica de performance (SEO + GEO)
- Plano contratado

## Hierarquia de domínio

```
CONTA
  └── PROJETO (o negócio e o blog — agrega tudo)
        ├── BLOG (canal de publicação)
        ├── BRIEFING DE NEGÓCIO (global, por projeto)
        └── ESTRATÉGIA (múltiplas)
              ├── BRIEFING DE ESTRATÉGIA (específico)
              ├── KEYWORD (com strategy_id)
              ├── TEMA (com strategy_id)
              │     └── ARTIGO (com strategy_id)
              └── MÉTRICA (SEO + GEO, com strategy_id)

TENDÊNCIA (global — pode virar TEMA em qualquer estratégia)
```

## Separação crítica: Projeto ≠ Estratégia

| Entidade | Papel | Exemplo |
|----------|-------|--------|
| **Projeto** | O negócio e o contexto central. Uma instância por empresa. | "Clínica Saúde Total" |
| **Estratégia** | Linha editorial ou hipótese operacional. Múltiplas por projeto. | "SEO Local", "Captação", "Social" |

**Regra**: Projeto agrega (blog, conta, briefing global). Estratégia foca (keywords, temas, artigos).

## Observações para implementação
O sistema deve ser estruturado em torno de `Estratégia` como contêiner operacional, dentro de `Projeto` como contexto de negócio.

### Relações
- uma **Conta** pode ter vários **Projetos**
- um **Projeto** pode ter um **Blog**
- um **Projeto** possui um **Briefing de negócio** (global)
- um **Projeto** possui várias **Estratégias**
- uma **Estratégia** possui um **Briefing de estratégia** (específico)
- uma **Estratégia** possui várias **Palavras-chave**
- uma **Estratégia** possui vários **Temas de conteúdo**
- um **Tema de conteúdo** pode originar um ou mais **Artigos**
- um **Projeto** pode ter várias **Referências**
- um **Projeto** pode ter vários **Insights de tendência**
- **Métricas de performance** podem ser agrupadas por Estratégia ou por Projeto
- uma **Conta** está associada a um **Plano contratado**

## Sugestão prática para o MVP
Manter o modelo o mais simples possível, mas já com `strategy_id` nas entidades editoriais:

- `accounts`
- `users`
- `projects`
- `blogs`
- `business_briefings` (briefing de negócio global — já implementado)
- `strategies` (**nova entidade** — múltiplas por projeto)
- `strategy_briefings` (briefing específico da estratégia)
- `keyword_candidates` (já implementado — adicionar `strategy_id`)
- `content_topics` (adicionar `strategy_id`)
- `content_briefs` (adicionar `strategy_id`)
- `articles` / `posts` (adicionar `strategy_id`)
- `references`
- `trend_insights`
- `tracking_events`
- `performance_metrics` (SEO + GEO)
- `subscription_plans`

## Campos importantes por entidade

### Projeto
- nome
- segmento
- localização
- status
- plano atual
- cms_provider
- domínio ou subdomínio

### Estratégia (nova entidade — `strategies`)
- `id`
- `project_id` (FK para projeto)
- `name` (ex: "SEO Local", "Captação via Blog")
- `focus` (objetivo declarado pelo usuário)
- `status`: configuring, active, paused, archived
- `operation_mode`: manual, assisted, automatic
- `created_at`
- `updated_at`

### Briefing de negócio (`business_briefings` — já implementado)
- Escopo: por projeto (global)
- alimenta o contexto base da conta

### Implementado no app atual

O briefing do negócio foi implementado como `business_briefings`, associado ao tenant e ao site atual.

Campos principais:

- `business_name`
- `segment`
- `offerings`
- `customer_profile`
- `location`
- `desired_keywords`
- `keyword_motivation`
- `competitors`
- `notes`
- `summary`
- `status`

Esta entidade cobre o briefing **global do projeto**. O briefing **específico de estratégia** (`strategy_briefings`) será uma entidade separada vinculada a `strategy_id`.

### Palavra-chave (implementada como `keyword_candidates`)

- `keyword`: O termo principal
- `journey_stage`: awareness, consideration, evaluation, decision (antigos top, middle, bottom mantidos para compatibilidade)
- `priority`: high, medium, low
- `tail_type`: short, long
- `difficulty`: 0-100 (SEO Difficulty)
- `search_volume`: Texto descritivo (ex: "100-500/mês" ou "Alto")
- `motivation`: Justificativa estratégica curta
- `estimated_potential`: Justificativa detalhada de ROI
- `status`: pending, approved, rejected

### Tema de conteúdo (`content_topics`)
- título sugerido
- justificativa
- keyword principal (FK)
- estágio da jornada
- prioridade
- status: suggested, pending_review, approved, in_production, rejected
- `strategy_id` (FK — **a ser adicionado**)
- data sugerida

### Artigo (`posts`)
- título
- meta description
- corpo
- status: draft, pending_review, approved, scheduled, published, rejected, updating, archived
- modo de geração
- data de publicação
- `strategy_id` (FK — **a ser adicionado**)
- origem do tema (FK para content_topics)
- versão

### Métrica de performance
- origem da métrica
- dimensão
- valor
- período
- camada: **seo** | **geo** (presença em IAs)
- página
- palavra-chave
- `strategy_id` (FK)

---

## Mudanças estruturais pendentes (impacto de banco)

| Mudança | Tabela afetada | Prioridade |
|---------|---------------|------------|
| Criar entidade `strategies` | Nova tabela | Alta |
| Adicionar `strategy_id` FK | keyword_candidates, content_topics, content_briefs, posts | Alta |
| Criar `strategy_briefings` | Nova tabela | Média |
| Adicionar campo `camada` (seo/geo) | performance_metrics | Média |
| Adicionar `operation_mode` | strategies | Alta |
