# Modelo de Dados e Entidades

## Entidades principais do sistema
- Usuário
- Conta
- Projeto
- Blog
- Template de blog
- Briefing
- Concorrente
- Palavra-chave
- Estágio da jornada
- Plano editorial
- Tema de conteúdo
- Artigo
- Referência
- Insight de tendência
- Evento de tracking
- Métrica de performance
- Plano contratado

## Observações para implementação
Recomenda-se que o sistema seja estruturado em torno de `Projeto`, que funciona como agregador principal do contexto.

### Relações sugeridas
- uma **Conta** pode ter vários **Projetos**
- um **Projeto** pode ter um **Blog**
- um **Projeto** possui um **Briefing**
- um **Projeto** possui várias **Palavras-chave**
- um **Projeto** possui um **Plano editorial**
- um **Plano editorial** possui vários **Temas de conteúdo**
- um **Tema de conteúdo** pode originar um ou mais **Artigos**
- um **Projeto** pode ter várias **Referências**
- um **Projeto** pode ter vários **Insights de tendência**
- um **Projeto** pode ter vários **Eventos de tracking**
- um **Projeto** agrega várias **Métricas de performance**
- uma **Conta** está associada a um **Plano contratado**

## Sugestão prática para o MVP
Manter o modelo inicial o mais simples possível:
- `accounts`
- `users`
- `projects`
- `blogs`
- `briefings`
- `keywords`
- `content_plans`
- `content_topics`
- `articles`
- `references`
- `trend_insights`
- `tracking_events`
- `performance_metrics`
- `subscription_plans`

## Campos importantes por entidade

### Projeto
- nome
- segmento
- localização
- status
- plano atual
- modo de operação
- cms_provider
- domínio ou subdomínio

### Briefing
- resumo do negócio
- serviços/produtos
- perfil de cliente
- concorrentes
- palavras iniciais
- observações estratégicas

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

Esta entidade cobre a primeira versão persistida do briefing. A ligação automática com estratégia de keywords e plano editorial fica para a próxima etapa.

### Palavra-chave
- termo
- origem
- dificuldade relativa
- potencial estimado
- prioridade
- estágio da jornada
- cauda
- status de aprovação

### Tema de conteúdo
- título sugerido
- justificativa
- palavra-chave principal
- estágio da jornada
- prioridade
- status
- data sugerida

### Artigo
- título
- meta description
- corpo
- status
- modo de geração
- data de publicação
- origem do tema
- versão

### Métrica de performance
- origem da métrica
- dimensão
- valor
- período
- camada
- página
- palavra-chave
