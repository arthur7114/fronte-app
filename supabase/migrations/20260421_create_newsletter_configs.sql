-- Create newsletter_configs table
CREATE TABLE IF NOT EXISTS newsletter_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    title TEXT NOT NULL DEFAULT 'Receba nossas dicas semanais',
    description TEXT NOT NULL DEFAULT 'Conteúdo exclusivo sobre saúde bucal direto no seu e-mail. Zero spam.',
    cta_label TEXT NOT NULL DEFAULT 'Quero receber',
    success_message TEXT NOT NULL DEFAULT 'Pronto! Confirme seu e-mail na caixa de entrada para começar.',
    placement TEXT NOT NULL DEFAULT 'inline',
    trigger_type TEXT NOT NULL DEFAULT 'scroll',
    trigger_value INTEGER NOT NULL DEFAULT 50,
    ask_name BOOLEAN NOT NULL DEFAULT true,
    privacy_consent BOOLEAN NOT NULL DEFAULT true,
    incentive BOOLEAN NOT NULL DEFAULT true,
    incentive_text TEXT NOT NULL DEFAULT 'Ganhe o e-book gratuito',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expose via RLS
ALTER TABLE newsletter_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view newsletter_configs for their tenant"
    ON newsletter_configs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM memberships m
        WHERE m.tenant_id = newsletter_configs.tenant_id
        AND m.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert newsletter_configs for their tenant"
    ON newsletter_configs FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM memberships m
        WHERE m.tenant_id = newsletter_configs.tenant_id
        AND m.user_id = auth.uid()
    ));

CREATE POLICY "Users can update newsletter_configs for their tenant"
    ON newsletter_configs FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM memberships m
        WHERE m.tenant_id = newsletter_configs.tenant_id
        AND m.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete newsletter_configs for their tenant"
    ON newsletter_configs FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM memberships m
        WHERE m.tenant_id = newsletter_configs.tenant_id
        AND m.user_id = auth.uid()
    ));
