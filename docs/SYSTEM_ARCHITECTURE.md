# System Architecture

## Overview

Este documento descreve a arquitetura técnica completa da plataforma.

A aplicação é um SaaS multitenant composto por:

- Web Application (Next.js)
- Supabase (PostgreSQL + Auth + Storage + RLS)
- Worker Process
- AI Providers
- Reverse Proxy (opcional em produção própria)

A arquitetura foi projetada para suportar:

- geração automatizada de conteúdo
- múltiplos blogs por tenant
- execução assíncrona de tarefas pesadas
- renderização pública de blogs
- desenvolvimento Agent-First

---

# High-Level Architecture

```
                    Internet
                       │
                       │
              ┌────────┴────────┐
              │                 │
         Painel Admin      Blog Público
              │                 │
              └────────┬────────┘
                       │
                  Web Application
                    (Next.js)
                       │
            ┌──────────┼──────────┐
            │          │          │
        Supabase    Supabase   Supabase
         Auth       Database    Storage
                   (PostgreSQL)
                       │
                  Job Queue Table
                       │
                     Worker
                       │
                AI Providers APIs
```

---

# Core Components

## Supabase

Supabase fornece a camada de infraestrutura do MVP:

- **Database**: PostgreSQL gerenciado com RLS nativo
- **Auth**: Autenticação (email, OAuth, magic link) sem implementação manual
- **Storage**: Upload e servimento de imagens, thumbnails e assets
- **Realtime**: Possibilidade futura de notificações em tempo real
- **Edge Functions**: Funções serverless para webhooks e integrações leves

### Vantagens para o MVP

- elimina necessidade de provisionar e gerenciar banco de dados
- Auth pronto, sem precisar de NextAuth ou tabelas de sessão manuais
- RLS garante isolamento por `tenant_id` diretamente no banco
- Storage com CDN incluso

---

# Web Application

Aplicação principal construída em Next.js.

Responsabilidades:

- dashboard SaaS
- gerenciamento de conteúdo
- configuração de automação
- configuração de IA
- APIs internas (Server Actions / Route Handlers)
- renderização de páginas do blog público

A autenticação é delegada ao Supabase Auth via `@supabase/ssr`.

---

# Blog Rendering

Os blogs públicos são renderizados pela mesma aplicação Next.js.

O sistema identifica o site usando:

```
host header
```

Exemplo:

```
cliente.super.com
```

Fluxo:

1. request chega
2. host é identificado
3. site correspondente é carregado do Supabase
4. tema e conteúdo são renderizados

---

# Worker System

Workers executam tarefas assíncronas.

Essas tarefas incluem:

- pesquisa de temas
- geração de briefs
- geração de conteúdo
- revisão de conteúdo
- agendamento de posts
- publicação automática

O worker conecta no Supabase via connection string do PostgreSQL.

Para o MVP, um único processo worker é suficiente.

---

# Job Queue

O sistema usa uma fila baseada no banco de dados do Supabase.

Tabela:

```
automation_jobs
```

Campos principais:

id, tenant_id, site_id, type, status, priority,
payload_json, result_json, error_message,
attempts, max_attempts, scheduled_for,
started_at, finished_at, created_at, updated_at

Lifecycle do job:

pending → running → completed | failed | cancelled

---

# Job Execution Flow

1. Web App cria job via Supabase client
2. Job é inserido no banco
3. Worker consulta jobs pendentes via connection string
4. Worker trava job com `SELECT ... FOR UPDATE SKIP LOCKED`
5. Worker executa tarefa
6. Worker atualiza status

---

# AI Providers

A plataforma pode usar diferentes provedores de IA.

Exemplos:

- OpenAI
- Anthropic
- Google AI

Cada tenant pode configurar:

- provider
- model
- API key

Alternativamente:

- usar créditos da plataforma

---

# AI Integration Layer

Camada responsável por:

- montar prompts
- enviar requests
- processar respostas
- aplicar regras editoriais

Essa camada usa:

- AI Preferences
- AI Rules
- Content Brief

---

# Object Storage

Gerenciado pelo Supabase Storage.

Usado para armazenar:

- imagens
- thumbnails
- assets do blog
- arquivos uploadados

O storage possui buckets configuráveis com políticas de acesso (RLS).

---

# Domain Resolution

Domínios possíveis:

Subdomínio da plataforma:

```
cliente.super.com
```

Domínio customizado (futuro):

```
blog.cliente.com
```

Fluxo de resolução:

1. request chega
2. host header é analisado
3. sistema consulta tabela `sites` no Supabase
4. site correspondente é carregado

---

# Multi-Tenant Isolation

Isolamento baseado em **Row Level Security (RLS)** do PostgreSQL via Supabase.

Cada tabela possui políticas RLS que garantem:

```sql
WHERE tenant_id = auth.jwt() ->> 'tenant_id'
```

Isso substitui o filtro manual por um mecanismo nativo do banco, tornando impossível o vazamento de dados entre clientes.

---

# Content Generation Flow

Fluxo completo de geração automática:

1. usuário ativa automação
2. sistema cria job `research_topics`
3. worker executa pesquisa
4. temas são gerados
5. usuário aprova temas
6. sistema gera briefs
7. sistema gera drafts
8. posts são agendados
9. worker publica posts

---

# Scheduled Publishing

Posts agendados possuem campo:

```
published_at
```

Worker verifica:

```sql
SELECT * FROM posts WHERE published_at <= now() AND status = 'scheduled'
```

Quando encontrado:

- status atualizado para `published`
- sitemap atualizado

---

# Sitemap Generation

Após publicação:

1. post adicionado ao sitemap
2. sitemap regenerado
3. motores de busca podem detectar conteúdo novo

---

# Caching Strategy

Cache recomendado:

- páginas de blog (ISR do Next.js)
- home page do blog
- lista de posts

Cache pode ser invalidado quando:

- post publicado
- post editado

---

# Security Considerations

Principais medidas:

- RLS nativo no PostgreSQL via Supabase
- autenticação gerenciada pelo Supabase Auth
- proteção contra SQL injection (queries parametrizadas)
- validação de domínio customizado
- políticas de acesso em buckets de storage

---

# Scaling Strategy

Escala horizontal possível em:

- web application
- workers

Banco gerenciado pelo Supabase com possibilidade de upgrade de plano.

Evolução futura:

- read replicas (disponível no Supabase Pro)
- separação de workloads

---

# Deployment Architecture

Stack do MVP:

| Camada | Tecnologia |
|--------|------------|
| Frontend + API | Next.js (Vercel ou VPS) |
| Banco + Auth + Storage | Supabase |
| Worker | Container separado (VPS / Cloud Run) |
| IA | OpenAI / Anthropic / Google AI |

Containers (se VPS):

- web (Next.js)
- worker

O banco, auth e storage são gerenciados pelo Supabase (sem container local).

---

# Future Improvements

Possíveis evoluções da arquitetura:

- distributed job queue (BullMQ + Redis)
- microservices
- AI pipeline orchestration
- event-driven architecture
- migração para infraestrutura própria

---

# Observações finais

A arquitetura foi desenhada para:

- simplicidade no MVP via Supabase
- escalabilidade gradual
- integração forte com IA
- compatibilidade com desenvolvimento Agent-First