# Workers and Jobs

## Overview

Este documento descreve a arquitetura assíncrona real do produto no estado atual do MVP.

O papel do worker é retirar tarefas de IA e processamento pesado do ciclo request-response do app web.

---

## Objetivo dos workers

Sem worker, operações como:

- pesquisa de temas
- geração de brief
- geração de draft

ficariam presas à interface, com mais risco de timeout e pior previsibilidade operacional.

No MVP atual, o worker resolve isso executando jobs em background a partir da tabela `automation_jobs`.

---

## Arquitetura atual

Componentes principais:

- `apps/web` em Next.js
- `apps/worker` como processo separado
- Supabase/Postgres como fila persistida

Modelo atual:

1. o app cria um job no banco
2. o worker faz polling de jobs elegíveis
3. o worker marca o job como `running`
4. executa a tarefa
5. grava resultado e metadados
6. finaliza como `completed` ou `failed`

---

## Tabela de jobs

A tabela base é `automation_jobs`.

Campos operacionais relevantes no fluxo atual:

- `id`
- `tenant_id`
- `site_id`
- `type`
- `status`
- `priority`
- `payload_json`
- `result_json`
- `error_message`
- `attempts`
- `max_attempts`
- `scheduled_for`
- `started_at`
- `finished_at`
- `created_at`
- `updated_at`

---

## Jobs ativos hoje

### `research_topics`

Responsável por:

- ler a configuração de automação
- usar o runtime de IA da plataforma
- criar `topic_candidates`

Saída esperada:

- `topic_candidate_ids` em `result_json`

### `generate_brief`

Responsável por:

- receber um topic aprovado
- montar o briefing editorial
- criar `content_briefs`

Saída esperada:

- `content_brief_id` em `result_json`

### `generate_post`

Responsável por:

- receber um briefing
- gerar um draft real
- criar um post em `draft`

Saída esperada:

- `post_id` em `result_json`

---

## Jobs previstos, mas ainda não concluídos

### `publish_post`

Continua previsto no escopo do produto, mas ainda não foi implementado no worker atual.

---

## Jobs futuros ou fora do fluxo atual

Estes itens ainda não fazem parte do runtime real do MVP:

- `review_post`
- `schedule_post`
- `refresh_content`

Eles podem voltar em fases futuras, mas não devem ser tratados como capacidade já entregue.

---

## Status de job

Estados usados no worker atual:

- `pending`
- `running`
- `completed`
- `failed`

O schema pode suportar mais estados no futuro, mas o fluxo ativo do MVP hoje gira nesses quatro.

---

## Retry e tolerância a falha

Política atual do MVP:

- jobs têm `max_attempts`
- o worker incrementa `attempts`
- falhas registram `error_message`
- o job termina em `failed` quando a execução não conclui com sucesso

O modelo atual é simples e suficiente para validar operação, sem orquestração distribuída.

---

## Locking e modelo de execução

O MVP trabalha com um modelo simples de worker:

- polling em banco
- claim de jobs elegíveis
- execução sequencial/pragmática

Ainda não existe estratégia avançada de múltiplos workers, shard de fila ou coordenação distribuída.

---

## Runtime de IA

Diretriz atual do produto:

- a IA é operada pela plataforma
- o usuário não fornece API key própria no MVP
- o worker usa credenciais do ambiente do projeto

Hoje o runtime ativo está centrado em OpenAI via ambiente global do projeto.

O `modelo` continua relevante como variável de:

- qualidade
- latência
- consumo
- custo operacional

Mesmo quando ele não estiver exposto na UI, o desenho do produto já precisa considerá-lo.

---

## Observabilidade atual

O sistema já registra o básico por job:

- status
- tentativas
- erro resumido
- timestamps
- resultado resumido

O app também já possui dashboard de jobs por tenant.

Pendência real:

- melhorar leitura operacional de falhas, throughput e consumo de IA

---

## Recomendação para o fechamento do MVP

Para fechar bem o escopo, os próximos passos naturais nesta camada são:

- implementar `publish_post`
- reforçar observabilidade de jobs
- preparar a futura leitura de consumo por modelo/créditos

O modelo atual já é suficiente para validar o pipeline central do produto sem aumentar a complexidade operacional cedo demais.
