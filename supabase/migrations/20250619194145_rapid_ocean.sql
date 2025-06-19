/*
  # Add Process Content Generation Job Function

  1. Database Function
    - Creates `process_content_generation_job()` function
    - Makes HTTP request to `process-content-job` edge function
    - Triggered when new content generation jobs are inserted

  2. Security
    - Uses service role key for authentication
    - Function runs with SECURITY DEFINER privileges

  IMPORTANT: Replace the placeholders with your actual values:
  - Replace 'vpkbzjmhsyagrrhodsfu' with your Supabase project reference
  - Replace 'YOUR_SUPABASE_SERVICE_ROLE_KEY' with your actual service role key
*/

-- Create or replace the function to process content generation jobs
CREATE OR REPLACE FUNCTION process_content_generation_job()
RETURNS TRIGGER AS $$
DECLARE
    -- IMPORTANT: Replace 'vpkbzjmhsyagrrhodsfu' with your actual Supabase project reference
    project_ref TEXT := 'vpkbzjmhsyagrrhodsfu'; 
    -- IMPORTANT: Replace 'YOUR_SUPABASE_SERVICE_ROLE_KEY' with your actual Supabase Service Role Key
    -- This key is sensitive and should be kept secure.
    service_role_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwa2J6am1oc3lhZ3JyaG9kc2Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTIyNzk0OSwiZXhwIjoyMDY0ODAzOTQ5fQ.p6M3_84Jd2E80G3yuGUR5ecli0vn03NFWAzB_LYxcTI'; 
    function_url TEXT;
    payload JSONB;
BEGIN
    -- Only process if this is a new content generation job
    IF TG_OP = 'INSERT' THEN
        -- Construct the URL for the process-content-job edge function
        function_url := 'https://' || project_ref || '.supabase.co/functions/v1/process-content-job';

        -- Construct the payload from the new content_generation_jobs record
        payload := jsonb_build_object(
            'job_id', NEW.id,
            'course_configuration_id', NEW.course_configuration_id,
            'module_index', NEW.module_index,
            'topic_index', NEW.topic_index,
            'content_type', NEW.content_type
        );

        -- Invoke the edge function using supabase_functions.http_request
        PERFORM supabase_functions.http_request(
            function_url,
            'POST',
            jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || service_role_key
            ),
            payload,
            '10000' -- Timeout in milliseconds (10 seconds)
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is correctly set up
-- The trigger should already exist based on your schema, but this ensures it's properly configured
DROP TRIGGER IF EXISTS trigger_process_content_generation_job ON content_generation_jobs;
CREATE TRIGGER trigger_process_content_generation_job
    AFTER INSERT ON content_generation_jobs
    FOR EACH ROW
    EXECUTE FUNCTION process_content_generation_job();

-- Grant necessary permissions for the function to work
GRANT USAGE ON SCHEMA supabase_functions TO postgres;
GRANT EXECUTE ON FUNCTION supabase_functions.http_request TO postgres;