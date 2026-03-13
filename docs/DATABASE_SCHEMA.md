# Database Schema

## Overview

O sistema utiliza PostgreSQL gerenciado pelo Supabase com arquitetura multi-tenant.

O isolamento entre clientes é garantido por **Row Level Security (RLS)** nativo do PostgreSQL.

Todos os registros relevantes possuem o campo `tenant_id`, e políticas RLS impedem acesso cruzado entre tenants.

A autenticação é gerenciada pelo `Supabase Auth` — a tabela `auth.users` é gerenciada automaticamente.

---

# Core Tables

## tenants

Representa a conta principal de um cliente.

Fields:

id  
name  
slug  
plan  
created_at  

---

## profiles

Dados complementares do usuário (vinculado a `auth.users`).

Fields:

id (referência a `auth.users.id`)  
full_name  
avatar_url  
created_at  

> A autenticação (email, password, OAuth) é gerenciada pelo Supabase Auth. Não é necessária tabela `users` manual.

---

## memberships

Relaciona usuários com tenants.

Fields:

user_id (referência a `auth.users.id`)  
tenant_id  
role  

Roles possíveis:

owner  
admin  
editor  

---

# Sites

## sites

Representa um site ou blog criado por um tenant.

Fields:

id  
tenant_id  
name  
subdomain  
custom_domain  
theme_id  
language  
created_at  

---

# Content

## posts

Artigos do blog.

Fields:

id  
tenant_id  
site_id  
title  
slug  
content  
status  
published_at  
created_at  

Status possíveis:

draft  
in_review  
approved  
scheduled  
published  
rejected  

---

## post_revisions

Histórico de edições.

Fields:

id  
post_id  
content  
created_at  

---

# AI Content

## content_briefs

Briefs gerados pela IA.

Fields:

id  
tenant_id  
topic  
keywords  
angle  
status  

---

## topic_candidates

Lista inicial de temas pesquisados.

Fields:

id  
tenant_id  
topic  
score  
source  

---

# AI Learning

## ai_rules

Regras aprendidas pela IA.

Fields:

id  
tenant_id  
rule_type  
content  

Tipos:

avoid_topic  
tone  
style  
structure  

---

## ai_preferences

Preferências editoriais do usuário.

Fields:

id  
tenant_id  
tone_of_voice  
writing_style  
expertise_level  

---

# Automation

## automation_configs

Configuração da automação de conteúdo.

Fields:

id  
tenant_id  
keywords_seed  
language  
frequency  
approval_required  

---

## automation_jobs

Jobs executados pelos workers.

Fields:

id  
tenant_id  
site_id  
type  
status  
priority  
payload_json  
result_json  
error_message  
attempts  
max_attempts  
scheduled_for  
started_at  
finished_at  
created_at  
updated_at  

Tipos:

research_topics  
generate_brief  
generate_post  
review_post  
schedule_post  
publish_post  
refresh_content  

Status:

pending  
running  
completed  
failed  
cancelled  

---

# Contacts

## contacts

Leads capturados no site.

Fields:

id  
tenant_id  
name  
email  
source  
created_at  

---

# Analytics

## post_metrics

Métricas de desempenho.

Fields:

id  
post_id  
views  
clicks  
rank_position  

---

# Storage

Gerenciado pelo Supabase Storage.

Buckets sugeridos:

- `avatars` — fotos de perfil
- `blog-assets` — imagens e arquivos dos posts
- `site-assets` — logos, favicons, assets do tema

Políticas de acesso controladas via RLS nos buckets.

---

# RLS Policies

Todas as tabelas com `tenant_id` devem ter políticas RLS ativas.

Exemplo de política:

```sql
CREATE POLICY "Tenant isolation" ON posts
  FOR ALL
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

---

# Indexing Strategy

Índices recomendados:

tenant_id  
site_id  
status  
published_at  

---

# Future Tables

Possíveis extensões:

email_sequences  
automation_triggers  
lead_tags  
crm_pipeline