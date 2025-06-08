/*
  # Video Conversations Schema for Tavus CVI Integration

  1. New Tables
    - `video_conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `course_id` (uuid, foreign key to course_configuration)
      - `conversation_type` (text, 'practice' or 'exam')
      - `tavus_replica_id` (text, AI persona ID from Tavus)
      - `tavus_conversation_id` (text, unique conversation session ID from Tavus)
      - `status` (text, conversation status)
      - `session_log` (jsonb, conversation events log)
      - `error_message` (text, error details if failed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `video_conversations` table
    - Add policies for users to manage their own conversations

  3. Indexes
    - Index on user_id for fast user conversation queries
    - Index on course_id for course-related conversations
    - Index on status for filtering active conversations
*/

CREATE TABLE IF NOT EXISTS video_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES course_configuration(id) ON DELETE CASCADE,
  conversation_type text NOT NULL CHECK (conversation_type IN ('practice', 'exam')),
  tavus_replica_id text NOT NULL,
  tavus_conversation_id text NOT NULL,
  status text NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'active', 'ended', 'failed')),
  session_log jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE video_conversations ENABLE ROW LEVEL SECURITY;

-- Policies for video_conversations
CREATE POLICY "Users can create their own video conversations"
  ON video_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own video conversations"
  ON video_conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own video conversations"
  ON video_conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video conversations"
  ON video_conversations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_conversations_user_id ON video_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_video_conversations_course_id ON video_conversations(course_id);
CREATE INDEX IF NOT EXISTS idx_video_conversations_status ON video_conversations(status);
CREATE INDEX IF NOT EXISTS idx_video_conversations_created_at ON video_conversations(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_video_conversations_updated_at
  BEFORE UPDATE ON video_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON video_conversations TO authenticated;