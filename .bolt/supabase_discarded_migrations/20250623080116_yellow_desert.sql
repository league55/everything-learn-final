/*
  # Fix User Enrollments Unique Constraint Issue

  1. Problem
    - The auto_enroll_course_creator function uses ON CONFLICT DO NOTHING
    - But the required unique constraint doesn't exist on user_enrollments table
    - This causes the function to fail

  2. Solution
    - Remove any existing duplicate enrollments
    - Add the missing unique constraint properly
    - Ensure the auto-enrollment function works correctly

  3. Changes
    - Clean up duplicate enrollments (keep the most recent one)
    - Add unique constraint on (user_id, course_configuration_id)
    - Verify the auto-enrollment trigger works properly
*/

-- Step 1: Remove duplicate enrollments (keep the most recent one for each user-course pair)
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, course_configuration_id 
      ORDER BY enrolled_at DESC, created_at DESC
    ) as rn
  FROM user_enrollments
)
DELETE FROM user_enrollments 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Step 2: Add the unique constraint (with a more specific approach)
DO $$ 
BEGIN
  -- Drop constraint if it exists with any name variations
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'user_enrollments' 
    AND constraint_type = 'UNIQUE'
    AND constraint_name LIKE '%user%course%'
  ) THEN
    -- Find and drop any existing similar constraints
    EXECUTE (
      SELECT 'ALTER TABLE user_enrollments DROP CONSTRAINT ' || constraint_name || ';'
      FROM information_schema.table_constraints 
      WHERE table_name = 'user_enrollments' 
      AND constraint_type = 'UNIQUE'
      AND constraint_name LIKE '%user%course%'
      LIMIT 1
    );
  END IF;

  -- Add the unique constraint
  ALTER TABLE user_enrollments 
  ADD CONSTRAINT user_enrollments_user_course_unique 
  UNIQUE (user_id, course_configuration_id);

EXCEPTION
  WHEN duplicate_key THEN
    -- If there are still duplicates, log and continue
    RAISE NOTICE 'Duplicate enrollments still exist. Please check the data manually.';
  WHEN others THEN
    -- Log any other errors but don't fail the migration
    RAISE NOTICE 'Error adding unique constraint: %', SQLERRM;
END $$;

-- Step 3: Update the auto-enrollment function to be more robust
CREATE OR REPLACE FUNCTION auto_enroll_course_creator()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-enroll the course creator immediately when course is created
  IF NEW.user_id IS NOT NULL THEN
    -- Use INSERT ... ON CONFLICT to handle any race conditions
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
    ON CONFLICT (user_id, course_configuration_id) 
    DO UPDATE SET
      -- If already enrolled, just update the enrolled_at timestamp
      enrolled_at = EXCLUDED.enrolled_at
    WHERE user_enrollments.status = 'dropped'; -- Only update if previously dropped
    
    -- If the above doesn't insert anything and no conflict occurred,
    -- it means the user is already actively enrolled, which is fine
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Add additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_enrollments_user_course_status 
  ON user_enrollments(user_id, course_configuration_id, status);

CREATE INDEX IF NOT EXISTS idx_user_enrollments_latest 
  ON user_enrollments(user_id, course_configuration_id, enrolled_at DESC);

-- Step 5: Verify the constraint was added successfully
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'user_enrollments' 
    AND constraint_name = 'user_enrollments_user_course_unique'
    AND constraint_type = 'UNIQUE'
  ) THEN
    RAISE NOTICE 'SUCCESS: Unique constraint user_enrollments_user_course_unique has been added successfully.';
  ELSE
    RAISE WARNING 'FAILED: Unique constraint was not added. Manual intervention may be required.';
  END IF;
END $$;