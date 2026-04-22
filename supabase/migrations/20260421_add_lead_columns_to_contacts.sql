-- Add remaining columns to contacts to support the full pipeline lead metrics
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'novo',
ADD COLUMN IF NOT EXISTS interest text NOT NULL DEFAULT 'tudo',
ADD COLUMN IF NOT EXISTS source_article text DEFAULT NULL;
