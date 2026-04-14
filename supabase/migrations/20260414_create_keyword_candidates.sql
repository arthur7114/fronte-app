create table if not exists public.keyword_candidates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  keyword text not null,
  priority text not null check (priority in ('high', 'medium', 'low')),
  journey_stage text not null check (journey_stage in ('top', 'middle', 'bottom')),
  tail_type text not null check (tail_type in ('short', 'long')),
  motivation text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint keyword_candidates_tenant_keyword_unique unique (tenant_id, keyword)
);

alter table public.keyword_candidates enable row level security;

create policy "Members can read keyword candidates"
on public.keyword_candidates
for select
to authenticated
using (
  exists (
    select 1
    from public.memberships
    where memberships.tenant_id = keyword_candidates.tenant_id
      and memberships.user_id = auth.uid()
  )
);

create policy "Members can manage keyword candidates"
on public.keyword_candidates
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships
    where memberships.tenant_id = keyword_candidates.tenant_id
      and memberships.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.memberships
    where memberships.tenant_id = keyword_candidates.tenant_id
      and memberships.user_id = auth.uid()
  )
);
