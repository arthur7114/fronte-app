# Modelo de Dados e Entidades

## Entidades atuais reaproveitadas

- `users` via Supabase Auth
- `tenants`
- `memberships`
- `sites`
- `business_briefings`
- `strategies`
- `keyword_candidates`
- `topic_candidates`
- `posts`

## Entidades criadas no ciclo Data-centric
- `contacts` (Gestão de Leads unificada)
- `newsletter_configs` (Settings 1:1 por tenant)
- `analytics_daily` (Série temporal para tráfego/conversões)

## Novas Entidades: Concorrência Orgânica (SERP)
- `serp_snapshots` (Cache completo da query Serper.dev, expiração 72h)
- `serp_results` (Links individuais, títulos, PAA destrinchados do snapshot)
- `workspace_competitors` (Agregação de share of voice por tenant/site)

## Entidades do Workflow Editorial (adicionadas 2026-04-22)

- `article_generations` (pipeline de geração por artigo — 4 fases: research, structure, write, review)
  - Campos: `tenant_id`, `strategy_id`, `post_id`, `topic`, `primary_keyword`, `tone`, `target_length`, `additional_instructions`, `phase` (enum), `research_result` (JSONB), `structure_result` (JSONB), `write_result` (JSONB), `review_result` (JSONB), `started_at`, `completed_at`, `error_message`
  - Migration: `supabase/migrations/20260422_create_article_generations.sql` (criada, aguarda aplicação no Supabase live)

Novos campos em `posts` (mesma migration):
- `generation_id` — FK para `article_generations`
- `seo_score` — score 0-100 gerado pelo agente na fase review
- `approved_at` — timestamp de aprovação manual
- `approved_by` — FK para `auth.users`

## Hierarquia de dominio

```text
CONTA
  -> WORKSPACE / TENANT
    -> SITE / BLOG
    -> BUSINESS_BRIEFING
    -> STRATEGIES
      -> KEYWORD_CANDIDATES
      -> TOPIC_CANDIDATES
    -> POSTS
      -> ARTICLE_GENERATIONS (pipeline de IA por artigo)
    -> NEWSLETTER / LEADS / ANALYTICS
    -> SERP_SNAPSHOTS / WORKSPACE_COMPETITORS
```

## Terminologia de UX

| UX | Entidade atual |
|---|---|
| Workspace / Projeto | `tenants` |
| Site / Blog | `sites` |
| Briefing | `business_briefings` |
| Estrategia | `strategies` |
| Palavra-chave | `keyword_candidates` |
| Topico | `topic_candidates` |
| Artigo | `posts` |
| Leads | `contacts` |
| Newsletter | `newsletter_configs` |
| Analytics SEO/GEO | `analytics_daily` + GA4 Mestre (para IA) |
| Snapshot de SERP | `serp_snapshots` |
| Concorrente Consolidado | `workspace_competitors` |

## Sites e dominios personalizados

`sites` representa o canal publico do tenant. O campo `custom_domain` fica reservado para dominio do cliente, como `blog.cliente.com.br`, e deve coexistir com o subdominio da plataforma.

Estados esperados para o dominio customizado:

- `pending_dns`: dominio informado, aguardando CNAME correto
- `active`: CNAME verificado e SSL pronto
- `error`: falha de verificacao DNS, conflito ou erro de provisionamento

Quando a requisicao publica vier por dominio customizado, o app deve resolver o `site` pelo header `host` antes de cair no fluxo por subdominio. A primeira implementacao futura deve usar subdominio customizado via `CNAME`, nao dominio raiz.

## Multi-strategy

O modelo multi-strategy permanece.

- `/dashboard/estrategias` lista estrategias
- `/dashboard/estrategias/nova` cria a experiencia visual de nova estrategia
- `/dashboard/estrategias/[id]` concentra detalhe
- `/dashboard/estrategia*` existe apenas como compatibilidade

## Posts

`posts` seguem globais nesta fase.

- a UX deve filtrar ou agrupar artigos por estrategia
- o vinculo forte (`strategy_id`) em `posts` é **obrigatório** para garantir rastreabilidade total do motor de execução.

- publicacao agendada usa `status = scheduled` + `scheduled_for`; o cron muda temporariamente para `publishing` e finaliza em `published` ou `failed`.
- `site_integrations` guarda a configuracao de destino CMS por site/tenant para publicacao externa.

## Gaps de modelo (Resolvidos / Planejados)

A maioria das superfícies do protótipo já possui modelo de dados oficial no Supabase:

- ~~newsletter: campanhas, assinantes, envios e performance~~ (Resolvido via `newsletter_configs` e `contacts`)
- ~~leads: origem, status, responsavel e historico~~ (Resolvido via `contacts`)
- ~~analytics SEO/GEO: series temporais, canais, query terms e metricas de conversao~~ (SEO e Conversões via `analytics_daily`. GEO requer integração GA4 Server-to-Server)
- ~~blog publico por slug~~: fonte de conteudo é `posts`, topologia publica em `/blog/[slug]` (Resolvido)
- ~~pipeline de geracao de artigos~~ (Resolvido via `article_generations` — migration criada em 22/04, aguarda aplicação)
- calendario editorial: `scheduled_for` em `posts` serve como ancora; calendário visual consome esse campo via `ArticleItem.scheduledAt`

## Rastreamento de Tráfego de IAs (GEO)

Foi decidido não criar uma tabela específica de tokens/integrações para o cliente final. O tráfego GEO será obtido via **Google Analytics 4 Mestre (do Dev)**:
- Todos os blogs/sites gerados e trackeados pelo Fronte injetam eventos numa Propriedade Central (SaaS-owned).
- O backend consulta a GA4 Data API filtrando por `tenant_id` (via Custom Dimension) e agrupa referrers de IAs (ChatGPT, Perplexity, Claude).

## Regra de evolucao

Quando houver conflito entre modelo atual e experiencia do prototipo, criar adapters ou evoluir o modelo para servir a interface. A interface do prototipo nao deve ser reduzida para caber no legado.
