/*
  # Blockchain Certificates Schema

  1. New Tables
    - `certificates`
      - `id` (uuid, primary key)
      - `certificate_id` (text, unique certificate identifier)
      - `student_id` (uuid, foreign key to auth.users)
      - `course_id` (uuid, foreign key to course_configuration)
      - `course_name` (text, course name at time of certification)
      - `score` (integer, student's score)
      - `max_score` (integer, maximum possible score)
      - `examination_date` (timestamp, when exam was completed)
      - `transcript_hash` (text, hash of examination transcript)
      - `transcript_data` (jsonb, full examination transcript)
      - `metadata` (jsonb, certificate metadata)
      - `issuer_address` (text, Algorand address of issuer)
      - `blockchain_tx_id` (text, Algorand transaction ID)
      - `timestamp` (bigint, Unix timestamp)
      - `status` (text, certificate status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `algorand_address` (text, user's Algorand wallet address)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `certificate_verifications`
      - `id` (uuid, primary key)
      - `certificate_id` (text, foreign key to certificates)
      - `verifier_address` (text, address of verifier)
      - `verification_result` (jsonb, verification result data)
      - `verification_timestamp` (bigint, Unix timestamp)
      - `created_at` (timestamp)

    - `certificate_logs`
      - `id` (uuid, primary key)
      - `certificate_id` (text, foreign key to certificates)
      - `action` (text, action performed)
      - `details` (text, action details)
      - `timestamp` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own certificates
    - Add policies for public certificate verification

  3. Indexes
    - Index on certificate_id for fast lookups
    - Index on student_id for user certificate history
    - Index on course_id for course statistics
    - Index on status for filtering active certificates
*/

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id text UNIQUE NOT NULL,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES course_configuration(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  score integer NOT NULL,
  max_score integer NOT NULL,
  examination_date timestamptz NOT NULL,
  transcript_hash text NOT NULL,
  transcript_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  issuer_address text DEFAULT '',
  blockchain_tx_id text,
  timestamp bigint NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  algorand_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Certificate verification logs
CREATE TABLE IF NOT EXISTS certificate_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id text NOT NULL REFERENCES certificates(certificate_id) ON DELETE CASCADE,
  verifier_address text,
  verification_result jsonb NOT NULL,
  verification_timestamp bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Certificate action logs
CREATE TABLE IF NOT EXISTS certificate_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id text NOT NULL REFERENCES certificates(certificate_id) ON DELETE CASCADE,
  action text NOT NULL,
  details text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_logs ENABLE ROW LEVEL SECURITY;

-- Policies for certificates
CREATE POLICY "Users can read their own certificates"
  ON certificates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "System can create certificates"
  ON certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "System can update certificates"
  ON certificates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Public certificate verification"
  ON certificates
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policies for user_profiles
CREATE POLICY "Users can read their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for certificate_verifications (public read for transparency)
CREATE POLICY "Public verification logs"
  ON certificate_verifications
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can log verifications"
  ON certificate_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for certificate_logs (admin only for now)
CREATE POLICY "Public certificate logs"
  ON certificate_logs
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can create certificate logs"
  ON certificate_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_blockchain_tx ON certificates(blockchain_tx_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_algorand_address ON user_profiles(algorand_address);

CREATE INDEX IF NOT EXISTS idx_certificate_verifications_certificate_id ON certificate_verifications(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificate_verifications_timestamp ON certificate_verifications(verification_timestamp);

CREATE INDEX IF NOT EXISTS idx_certificate_logs_certificate_id ON certificate_logs(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificate_logs_timestamp ON certificate_logs(timestamp DESC);

-- Triggers for updated_at
CREATE TRIGGER update_certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get certificate statistics for a course
CREATE OR REPLACE FUNCTION get_course_certificate_stats(p_course_id uuid)
RETURNS TABLE (
  total_certificates bigint,
  average_score numeric,
  achievement_distribution jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_certificates,
    ROUND(AVG(score::numeric / max_score::numeric * 100), 2) as average_score,
    jsonb_object_agg(
      COALESCE(metadata->>'achievementLevel', 'bronze'),
      achievement_count
    ) as achievement_distribution
  FROM (
    SELECT 
      score,
      max_score,
      metadata,
      COUNT(*) as achievement_count
    FROM certificates 
    WHERE course_id = p_course_id 
      AND status = 'active'
    GROUP BY score, max_score, metadata->>'achievementLevel'
  ) stats;
END;
$$;

-- Function to verify certificate exists and is valid
CREATE OR REPLACE FUNCTION verify_certificate(p_certificate_id text)
RETURNS TABLE (
  is_valid boolean,
  certificate_data jsonb,
  verification_timestamp bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cert_record certificates%ROWTYPE;
BEGIN
  SELECT * INTO cert_record
  FROM certificates
  WHERE certificate_id = p_certificate_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false as is_valid,
      '{"error": "Certificate not found"}'::jsonb as certificate_data,
      EXTRACT(epoch FROM now())::bigint * 1000 as verification_timestamp;
    RETURN;
  END IF;

  IF cert_record.status = 'revoked' THEN
    RETURN QUERY SELECT 
      false as is_valid,
      jsonb_build_object(
        'error', 'Certificate has been revoked',
        'certificate_id', cert_record.certificate_id,
        'revoked_status', true
      ) as certificate_data,
      EXTRACT(epoch FROM now())::bigint * 1000 as verification_timestamp;
    RETURN;
  END IF;

  -- Log verification attempt
  INSERT INTO certificate_verifications (
    certificate_id,
    verification_result,
    verification_timestamp
  ) VALUES (
    p_certificate_id,
    jsonb_build_object('verified', true, 'timestamp', EXTRACT(epoch FROM now())::bigint * 1000),
    EXTRACT(epoch FROM now())::bigint * 1000
  );

  RETURN QUERY SELECT 
    true as is_valid,
    row_to_json(cert_record)::jsonb as certificate_data,
    EXTRACT(epoch FROM now())::bigint * 1000 as verification_timestamp;
END;
$$;

-- Grant permissions
GRANT ALL ON certificates TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON certificate_verifications TO authenticated;
GRANT ALL ON certificate_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_course_certificate_stats(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION verify_certificate(text) TO authenticated, anon;