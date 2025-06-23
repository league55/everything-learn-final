/*
  # Fix User Enrollments Unique Constraint

  1. Clean up duplicate enrollments
  2. Add missing unique constraint for ON CONFLICT clause
  3. Update auto-enrollment function
  4. Add performance indexes
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

-- Step 2: Add the unique constraint with proper error handling
DO $$ 
BEGIN
  -- First, check if any constraint with similar name exists and drop it
  DECLARE
    constraint_name_to_drop TEXT;
  BEGIN
    SELECT tc.constraint_name INTO constraint_name_to_drop
    FROM information_schema.table_constraints tc
    WHERE tc.table_name = 'user_enrollments' 
      AND tc.constraint_type = 'UNIQUE'
      AND tc.constraint_name LIKE '%user%course%'
    LIMIT 1;
    
    IF constraint_name_to_drop IS NOT NULL THEN
      EXECUTE 'ALTER TABLE user_enrollments DROP CONSTRAINT ' || constraint_name_to_drop;
      RAISE NOTICE 'Dropped existing constraint: %', constraint_name_to_drop;
    END IF;
  END;

  -- Add the unique constraint
  BEGIN
    ALTER TABLE user_enrollments 
    ADD CONSTRAINT user_enrollments_user_course_unique 
    UNIQUE (user_id, course_configuration_id);
    
    RAISE NOTICE 'Successfully added unique constraint: user_enrollments_user_course_unique';
    
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'Duplicate enrollments still exist. Cleaning up and retrying...';
      
      -- Additional cleanup for any remaining duplicates
      WITH remaining_duplicates AS (
        SELECT 
          id,
          ROW_NUMBER() OVER (
            PARTITION BY user_id, course_configuration_id 
            ORDER BY 
              CASE WHEN status = 'active' THEN 1 ELSE 2 END,
              enrolled_at DESC, 
              created_at DESC
          ) as rn
        FROM user_enrollments
      )
      DELETE FROM user_enrollments 
      WHERE id IN (
        SELECT id FROM remaining_duplicates WHERE rn > 1
      );
      
      -- Try adding constraint again
      ALTER TABLE user_enrollments 
      ADD CONSTRAINT user_enrollments_user_course_unique 
      UNIQUE (user_id, course_configuration_id);
      
      RAISE NOTICE 'Successfully added unique constraint after cleanup';
      
    WHEN others THEN
      RAISE NOTICE 'Error adding unique constraint: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
  END;
END $$;

-- Step 3: Update the auto-enrollment function to be more robust
CREATE OR REPLACE FUNCTION auto_enroll_course_creator()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-enroll the course creator immediately when course is created
  IF NEW.user_id IS NOT NULL THEN
    BEGIN
      -- Try to insert new enrollment
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
      );
      
      RAISE NOTICE 'Auto-enrolled user % in course %', NEW.user_id, NEW.id;
      
    EXCEPTION
      WHEN unique_violation THEN
        -- User is already enrolled, check if we need to reactivate
        UPDATE user_enrollments 
        SET 
          status = 'active',
          enrolled_at = NOW()
        WHERE user_id = NEW.user_id 
          AND course_configuration_id = NEW.id 
          AND status = 'dropped';
          
        RAISE NOTICE 'User % already enrolled in course %, reactivated if previously dropped', NEW.user_id, NEW.id;
        
      WHEN others THEN
        -- Log any other errors but don't fail the course creation
        RAISE NOTICE 'Error auto-enrolling user % in course %: % (SQLSTATE: %)', NEW.user_id, NEW.id, SQLERRM, SQLSTATE;
    END;
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