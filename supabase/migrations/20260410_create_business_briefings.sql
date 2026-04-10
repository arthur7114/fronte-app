create table if not exists public.business_briefings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  site_id uuid references public.sites(id) on delete set null,
  business_name text not null,
  segment text not null,
  offerings text not null,
  customer_profile text not null,
  location text,
  desired_keywords text[],
  keyword_motivation text,
  competitors text[],
  notes text,
  summary text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_briefings_tenant_unique unique (tenant_id)
);

alter table public.business_briefings enable row level security;

create policy "Members can read business briefings"
on public.business_briefings
for select
to authenticated
using (
  exists (
    select 1
    from public.memberships
    where memberships.tenant_id = business_briefings.tenant_id
      and memberships.user_id = auth.uid()
  )
);

create policy "Members can manage business briefings"
on public.business_briefings
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships
    where memberships.tenant_id = business_briefings.tenant_id
      and memberships.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.memberships
    where memberships.tenant_id = business_briefings.tenant_id
      and memberships.user_id = auth.uid()
  )
);
