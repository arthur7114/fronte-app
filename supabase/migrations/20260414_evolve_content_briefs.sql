-- Migration: evolve_content_briefs
-- Adds strategic metadata to support Phase 6 high-fidelity drafting

ALTER TABLE public.content_briefs
ADD COLUMN IF NOT EXISTS justification TEXT,
ADD COLUMN IF NOT EXISTS journey_stage TEXT,
ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.topic_candidates(id);

-- Add comments for clarity
COMMENT ON COLUMN public.content_briefs.justification IS 'The strategic rationale carried over from the approved topic candidate';
COMMENT ON COLUMN public.content_briefs.journey_stage IS 'The marketing journey stage (awareness, consideration, evaluation, decision)';
COMMENT ON COLUMN public.content_briefs.topic_id IS 'Reference to the original topic candidate that generated this brief';
