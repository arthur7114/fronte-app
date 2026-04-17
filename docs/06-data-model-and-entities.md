# Modelo de Dados e Entidades

## Entidades principais do sistema

- usuario
- tenant / workspace
- membership
- site
- business_briefing
- strategy
- keyword_candidate
- topic_candidate
- post
- trend_insight
- analytics metrics

---

## Hierarquia de dominio

```text
CONTA
  -> WORKSPACE / TENANT
    -> SITE
    -> BUSINESS_BRIEFING
    -> STRATEGIES
      -> KEYWORD_CANDIDATES
      -> TOPIC_CANDIDATES
      -> POSTS
```

### Terminologia adotada

| Termo de UX | Entidade atual |
|-------------|----------------|
| Workspace / Projeto | `tenants` |
| Membro do workspace | `memberships` |
| Site / Blog | `sites` |
| Briefing do negocio | `business_briefings` |
| Estrategia | `strategies` |
| Palavra-chave | `keyword_candidates` |
| Tema | `topic_candidates` |
| Artigo | `posts` |

---

## Separacao entre projeto e estrategia

Projeto e estrategia continuam sendo conceitos diferentes.

| Camada | Papel |
|--------|------|
| Projeto / workspace | contexto do negocio, configuracao e canal |
| Estrategia | foco editorial especifico dentro do mesmo projeto |

O modelo multi-strategy permanece ativo nesta fase.

Isso significa:

- um workspace pode ter varias estrategias
- a UX lista essas estrategias em `/dashboard/estrategia`
- o detalhe da estrategia acontece em `/dashboard/estrategia/[id]`

---

## Entidades reutilizadas nesta migracao

### `tenants`

Representam o workspace principal do usuario.

### `memberships`

Vinculam usuario e workspace.

### `sites`

Representam o canal de publicacao do workspace.

### `business_briefings`

Guardam o contexto do negocio usado no onboarding e no produto recorrente.

### `strategies`

Representam as linhas editoriais do workspace.

Campos relevantes:

- `name`
- `focus`
- `status`
- `operation_mode`
- `tenant_id`

### `keyword_candidates`

Representam palavras sugeridas ou aprovadas para operacao editorial.

### `topic_candidates`

Representam temas gerados a partir das keywords e da estrategia.

### `posts`

Representam os artigos reais da operacao editorial.

---

## Regra explicita desta fase

`posts` seguem globais nesta fase.

Isso significa:

- o produto pode filtrar artigos por estrategia na UX quando isso fizer sentido
- esse filtro nao implica, nesta entrega, a introducao de um vinculo obrigatorio de banco com `strategy_id`
- a navegacao e o modelo de experiencia mudaram antes da obrigatoriedade de alterar toda a modelagem editorial

---

## Relacoes principais

- um usuario pode pertencer a varios workspaces via `memberships`
- um workspace possui um `site`
- um workspace possui um `business_briefing`
- um workspace possui varias `strategies`
- uma estrategia pode orientar keywords e topics
- posts continuam operando como entidade editorial global do workspace nesta fase

---

## Implicacoes para implementacao

- reaproveitar entidades existentes e preferivel quando elas nao contradizem o prototipo
- a camada de UX pode reorganizar o fluxo sem exigir remodelagem imediata do banco
- quando houver conflito futuro entre experiencia desejada e modelo atual, o modelo deve ser adaptado para servir ao prototipo
