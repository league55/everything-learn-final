-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_process_content_generation_job ON content_generation_jobs;

-- Create the direct HTTP trigger for content generation jobs
-- This follows the same pattern as the existing syllabus generation trigger
CREATE TRIGGER "trigger_process_content_generation_job"
    AFTER INSERT ON public.content_generation_jobs 
    FOR EACH ROW 
    EXECUTE FUNCTION supabase_functions.http_request(
        'https://vpkbzjmhsyagrrhodsfu.supabase.co/functions/v1/process-content-job', 
        'POST', 
        '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwa2J6am1oc3lhZ3JyaG9kc2Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTIyNzk0OSwiZXhwIjoyMDY0ODAzOTQ5fQ.p6M3_84Jd2E80G3yuGUR5ecli0vn03NFWAzB_LYxcTI"}', 
        '{}', 
        '10000'
    );

-- Ensure the http extension is enabled (if not already)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'http'
    ) THEN
        CREATE EXTENSION IF NOT EXISTS http;
    END IF;
EXCEPTION
    WHEN insufficient_privilege THEN
        -- Extension might already be enabled at the database level
        NULL;
END $$;