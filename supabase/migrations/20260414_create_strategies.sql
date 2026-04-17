-- ============================================================
-- 20260414_create_strategies.sql
-- Introduz a entidade `strategies` como contêiner operacional.
-- Implementa a separação Projeto ≠ Estratégia (doc 06 e 14).
-- ============================================================

-- 1. Tabela principal strategies
create table if not exists public.strategies (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  name          text not null,
  focus         text,
  status        text not null default 'active'
                  check (status in ('configuring', 'active', 'paused', 'archived')),
  operation_mode text not null default 'manual'
                  check (operation_mode in ('manual', 'assisted', 'automatic')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  public.strategies              is 'Linha editorial ou hipótese operacional dentro de um projeto. Múltiplas por tenant.';
comment on column public.strategies.name         is 'Nome dado pelo usuário (ex: "SEO Local", "Captação via Blog")';
comment on column public.strategies.focus        is 'Objetivo declarado desta estratégia';
comment on column public.strategies.status       is 'configuring | active | paused | archived';
comment on column public.strategies.operation_mode is 'manual | assisted | automatic — controla nível de automação da IA';

-- 2. RLS
alter table public.strategies enable row level security;

create policy "Members can read strategies"
on public.strategies
for select to authenticated
using (
  exists (
    select 1 from public.memberships
    where memberships.tenant_id = strategies.tenant_id
      and memberships.user_id   = auth.uid()
  )
);

create policy "Members can manage strategies"
on public.strategies
for all to authenticated
using (
  exists (
    select 1 from public.memberships
    where memberships.tenant_id = strategies.tenant_id
      and memberships.user_id   = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.memberships
    where memberships.tenant_id = strategies.tenant_id
      and memberships.user_id   = auth.uid()
  )
);

-- 3. Adiciona strategy_id (nullable) nas entidades editoriais existentes
--    nullable = retrocompatível; rows sem strategy_id pertencem à estratégia padrão

alter table public.keyword_candidates
  add column if not exists strategy_id uuid references public.strategies(id) on delete set null;

alter table public.topic_candidates
  add column if not exists strategy_id uuid references public.strategies(id) on delete set null;

alter table public.content_briefs
  add column if not exists strategy_id uuid references public.strategies(id) on delete set null;

-- 4. Índices para queries frequentes
create index if not exists strategies_tenant_id_idx
  on public.strategies (tenant_id);

create index if not exists keyword_candidates_strategy_id_idx
  on public.keyword_candidates (strategy_id);

create index if not exists topic_candidates_strategy_id_idx
  on public.topic_candidates (strategy_id);

create index if not exists content_briefs_strategy_id_idx
  on public.content_briefs (strategy_id);
