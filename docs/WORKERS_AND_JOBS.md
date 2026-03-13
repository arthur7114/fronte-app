# Workers and Jobs

## Overview

Este documento descreve a arquitetura de execução assíncrona da plataforma.

O objetivo é retirar tarefas demoradas do ciclo request-response da aplicação web.

---

## Why Workers Exist

Sem workers, operações como pesquisa de temas, geração de conteúdo e publicação agendada poderiam:

- bloquear a interface
- gerar timeout
- comprometer a estabilidade da aplicação web

Workers resolvem isso executando jobs em background.

---

## Base Architecture

Componentes principais:

- web (Next.js)
- worker (container separado)
- Supabase (PostgreSQL gerenciado)

O worker conecta no Supabase via connection string do PostgreSQL.

Opcional futuramente:

- redis (para job queue distribuída)

---

## Execution Model

1. aplicação web cria job no banco
2. worker consulta jobs pendentes
3. worker trava job para execução
4. worker executa tarefa
5. worker salva resultado
6. worker atualiza status

---

## Job Table

Tabela base:

automation_jobs

Campos sugeridos:

- id
- tenant_id
- site_id
- type
- status
- priority
- payload_json
- result_json
- error_message
- attempts
- max_attempts
- scheduled_for
- started_at
- finished_at
- created_at
- updated_at

---

## Job Types

### research_topics

Responsável por:

- pesquisar palavras-chave
- identificar concorrentes
- gerar topics iniciais

---

### generate_brief

Responsável por:

- gerar brief a partir de topic aprovado

---

### generate_post

Responsável por:

- gerar draft completo do artigo

---

### review_post

Responsável por:

- aplicar regras editoriais
- checagens automáticas futuras

---

### schedule_post

Responsável por:

- calcular ou registrar data de publicação

---

### publish_post

Responsável por:

- publicar post
- atualizar sitemap
- atualizar status

---

### refresh_content

Futuro:

- revisar conteúdo antigo
- sugerir atualização

---

## Job Status

- pending
- running
- completed
- failed
- cancelled

---

## Retry Policy

Recomendação inicial:

- max_attempts = 3
- retry com atraso incremental
- falha permanente após limite

---

## Worker Locking

Necessário evitar que dois workers executem o mesmo job.

Estratégia recomendada:

- atualização transacional no banco
- somente jobs pending elegíveis
- marcar running antes da execução

---

## Scheduling Logic

Jobs podem ter:

scheduled_for

Isso permite que o worker só execute quando:

scheduled_for <= now()

---

## Observability

Registrar para cada job:

- tempo de execução
- tipo
- tenant
- erro
- payload resumido
- resultado resumido

---

## MVP Recommendation

Para o MVP, usar:

- fila baseada em PostgreSQL (Supabase)
- um único worker container conectando via connection string
- retries básicos
- logs simples

Isso é suficiente para validar o produto.