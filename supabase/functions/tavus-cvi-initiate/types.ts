export interface TavusCviRequest {
  courseId: string
  userId: string
  userName: string
  courseDepth: number
  conversationType: 'practice' | 'exam'
  courseTopic: string
  moduleSummary: string
}

export interface TavusCviResponse {
  conversation_id: string
  replica_id: string
  status: string
}

export interface TavusApiResponse {
  conversation_id: string
  status: string
  replica_id: string
  conversation_url?: string
}

export interface VideoConversation {
  id: string
  user_id: string
  course_id: string
  conversation_type: 'practice' | 'exam'
  tavus_replica_id: string
  tavus_conversation_id: string
  status: 'initiated' | 'active' | 'ended' | 'failed'
  session_log: Record<string, any>
  error_message: string | null
  created_at: string
  updated_at: string
}