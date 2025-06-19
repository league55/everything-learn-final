/*
  # Immediate Auto-Enrollment for Course Creators

  1. Changes
    - Move auto-enrollment trigger from syllabus completion to course creation
    - Users get enrolled immediately when they create a course
    - No need to wait for syllabus generation to complete

  2. Security
    - Only enrolls the actual course creator (user_id matches)
    - Prevents duplicate enrollments
    - Uses SECURITY DEFINER for proper permissions
*/

-- Drop the existing trigger that waits for syllabus completion
DROP TRIGGER IF EXISTS trigger_auto_enroll_course_creator ON syllabus;

-- Update the function to work with course_configuration instead of syllabus
CREATE OR REPLACE FUNCTION auto_enroll_course_creator()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-enroll the course creator immediately when course is created
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO user_enrollments (
      user_id,
      course_configuration_id,
      status,
      current_module_index,
      enrolled_at
    )
    VALUES (
      NEW.user_id,
      NEW.id,
      'active',
      0,
      NOW()
    )
    -- Only insert if not already enrolled (safety check)
    ON CONFLICT (user_id, course_configuration_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger on course_configuration table for immediate enrollment
CREATE TRIGGER trigger_auto_enroll_course_creator
  AFTER INSERT ON course_configuration
  FOR EACH ROW
  EXECUTE FUNCTION auto_enroll_course_creator();

-- Add unique constraint to prevent duplicate enrollments (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_enrollments_user_course_unique'
  ) THEN
    ALTER TABLE user_enrollments 
    ADD CONSTRAINT user_enrollments_user_course_unique 
    UNIQUE (user_id, course_configuration_id);
  END IF;
END $$;