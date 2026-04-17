-- Update the automation_jobs_type_check constraint to include the new job type
DO $$ 
BEGIN 
    ALTER TABLE public.automation_jobs DROP CONSTRAINT IF EXISTS automation_jobs_type_check;
    ALTER TABLE public.automation_jobs ADD CONSTRAINT automation_jobs_type_check 
        CHECK (type IN (
            'research_topics', 
            'generate_keyword_strategy', 
            'generate_brief', 
            'generate_post', 
            'review_post', 
            'schedule_post', 
            'publish_post', 
            'refresh_content'
        ));
END $$;
