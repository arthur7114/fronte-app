-- Blog settings, CMS integration configuration, and public site assets.

ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS primary_color text NOT NULL DEFAULT '#14b8a6',
  ADD COLUMN IF NOT EXISTS font_family text NOT NULL DEFAULT 'inter',
  ADD COLUMN IF NOT EXISTS logo_path text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS custom_domain_status text NOT NULL DEFAULT 'none';

ALTER TABLE public.sites
  DROP CONSTRAINT IF EXISTS sites_theme_id_check,
  ADD CONSTRAINT sites_theme_id_check
    CHECK (theme_id IS NULL OR theme_id IN ('starter', 'minimal', 'modern', 'magazine', 'bold')),
  DROP CONSTRAINT IF EXISTS sites_primary_color_check,
  ADD CONSTRAINT sites_primary_color_check
    CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  DROP CONSTRAINT IF EXISTS sites_font_family_check,
  ADD CONSTRAINT sites_font_family_check
    CHECK (font_family IN ('inter', 'serif', 'mono')),
  DROP CONSTRAINT IF EXISTS sites_custom_domain_status_check,
  ADD CONSTRAINT sites_custom_domain_status_check
    CHECK (custom_domain_status IN ('none', 'pending_dns', 'active', 'error'));

CREATE TABLE IF NOT EXISTS public.site_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  provider text NOT NULL,
  status text NOT NULL DEFAULT 'disconnected',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_integrations_provider_check
    CHECK (provider IN ('wordpress', 'webflow', 'custom')),
  CONSTRAINT site_integrations_status_check
    CHECK (status IN ('disconnected', 'configured', 'error')),
  CONSTRAINT site_integrations_unique_provider UNIQUE (site_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_site_integrations_tenant_id
  ON public.site_integrations(tenant_id);

ALTER TABLE public.site_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view site_integrations for their tenant"
  ON public.site_integrations;
CREATE POLICY "Users can view site_integrations for their tenant"
  ON public.site_integrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.memberships m
      WHERE m.tenant_id = site_integrations.tenant_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert site_integrations for their tenant"
  ON public.site_integrations;
CREATE POLICY "Users can insert site_integrations for their tenant"
  ON public.site_integrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.memberships m
      WHERE m.tenant_id = site_integrations.tenant_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update site_integrations for their tenant"
  ON public.site_integrations;
CREATE POLICY "Users can update site_integrations for their tenant"
  ON public.site_integrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.memberships m
      WHERE m.tenant_id = site_integrations.tenant_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.memberships m
      WHERE m.tenant_id = site_integrations.tenant_id
        AND m.user_id = auth.uid()
    )
  );

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'site-assets',
  'site-assets',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can read site assets"
  ON storage.objects;
CREATE POLICY "Public can read site assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Tenant members can upload site assets"
  ON storage.objects;
CREATE POLICY "Tenant members can upload site assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'site-assets'
    AND EXISTS (
      SELECT 1
      FROM public.memberships m
      WHERE m.tenant_id::text = (storage.foldername(name))[1]
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Tenant members can update site assets"
  ON storage.objects;
CREATE POLICY "Tenant members can update site assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'site-assets'
    AND EXISTS (
      SELECT 1
      FROM public.memberships m
      WHERE m.tenant_id::text = (storage.foldername(name))[1]
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'site-assets'
    AND EXISTS (
      SELECT 1
      FROM public.memberships m
      WHERE m.tenant_id::text = (storage.foldername(name))[1]
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Tenant members can delete site assets"
  ON storage.objects;
CREATE POLICY "Tenant members can delete site assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'site-assets'
    AND EXISTS (
      SELECT 1
      FROM public.memberships m
      WHERE m.tenant_id::text = (storage.foldername(name))[1]
        AND m.user_id = auth.uid()
    )
  );
