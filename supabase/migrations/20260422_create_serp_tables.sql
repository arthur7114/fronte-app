-- Create SERP Snapshots Table
CREATE TABLE public.serp_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    query_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for cache lookup
CREATE INDEX idx_serp_snapshots_lookup ON public.serp_snapshots(tenant_id, keyword, expires_at);

-- Create SERP Results Table (normalized for AI injection)
CREATE TABLE public.serp_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID NOT NULL REFERENCES public.serp_snapshots(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    snippet TEXT,
    is_competitor BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for querying results of a snapshot
CREATE INDEX idx_serp_results_snapshot ON public.serp_results(snapshot_id, position);

-- Create Workspace Competitors Table (Share of Voice tracking)
CREATE TABLE public.workspace_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    frequency_score INTEGER NOT NULL DEFAULT 1,
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, domain)
);

-- Index for ranking competitors
CREATE INDEX idx_workspace_competitors_ranking ON public.workspace_competitors(tenant_id, frequency_score DESC);

-- Enable RLS
ALTER TABLE public.serp_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serp_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_competitors ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their tenant serp_snapshots"
    ON public.serp_snapshots FOR SELECT
    USING (tenant_id IN (
        SELECT tenant_id FROM public.memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their tenant serp_snapshots"
    ON public.serp_snapshots FOR INSERT
    WITH CHECK (tenant_id IN (
        SELECT tenant_id FROM public.memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their tenant serp_snapshots"
    ON public.serp_snapshots FOR UPDATE
    USING (tenant_id IN (
        SELECT tenant_id FROM public.memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can view their tenant serp_results"
    ON public.serp_results FOR SELECT
    USING (snapshot_id IN (
        SELECT id FROM public.serp_snapshots WHERE tenant_id IN (
            SELECT tenant_id FROM public.memberships WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can insert their tenant serp_results"
    ON public.serp_results FOR INSERT
    WITH CHECK (snapshot_id IN (
        SELECT id FROM public.serp_snapshots WHERE tenant_id IN (
            SELECT tenant_id FROM public.memberships WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can update their tenant serp_results"
    ON public.serp_results FOR UPDATE
    USING (snapshot_id IN (
        SELECT id FROM public.serp_snapshots WHERE tenant_id IN (
            SELECT tenant_id FROM public.memberships WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can view their tenant workspace_competitors"
    ON public.workspace_competitors FOR SELECT
    USING (tenant_id IN (
        SELECT tenant_id FROM public.memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can modify their tenant workspace_competitors"
    ON public.workspace_competitors FOR ALL
    USING (tenant_id IN (
        SELECT tenant_id FROM public.memberships WHERE user_id = auth.uid()
    ));
