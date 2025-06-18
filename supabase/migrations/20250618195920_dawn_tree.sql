/*
  # Auto-enroll course creator

  1. New Function
    - `auto_enroll_course_creator` - Function to automatically enroll the course creator
  
  2. Updated Trigger
    - Modify existing trigger to call auto-enrollment after syllabus creation
*/

-- Function to auto-enroll course creator
CREATE OR REPLACE FUNCTION auto_enroll_course_creator()
RETURNS TRIGGER AS $$
BEGIN
  -- Only enroll if the syllabus was successfully completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get the course configuration to find the user_id
    INSERT INTO user_enrollments (
      user_id,
      course_configuration_id,
      status,
      current_module_index,
      enrolled_at
    )
    SELECT 
      cc.user_id,
      cc.id,
      'active',
      0,
      NOW()
    FROM course_configuration cc
    WHERE cc.id = NEW.course_configuration_id
      AND cc.user_id IS NOT NULL
      -- Only insert if not already enrolled
      AND NOT EXISTS (
        SELECT 1 FROM user_enrollments ue 
        WHERE ue.course_configuration_id = cc.id 
        AND ue.user_id = cc.user_id
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-enroll course creator when syllabus is completed
DROP TRIGGER IF EXISTS trigger_auto_enroll_course_creator ON syllabus;
CREATE TRIGGER trigger_auto_enroll_course_creator
  AFTER UPDATE ON syllabus
  FOR EACH ROW
  EXECUTE FUNCTION auto_enroll_course_creator();