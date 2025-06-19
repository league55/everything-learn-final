export interface CourseConfiguration {
  id: string
  topic: string
  context: string
  depth: number
  user_id: string
  created_at: string
  updated_at: string
}

export interface SyllabusModule {
  summary: string
  topics: SyllabusTopic[]
}

export interface SyllabusTopic {
  summary: string
  keywords: string[]
  content: string
  full_content_path?: string
}

export interface Syllabus {
  id: string
  course_configuration_id: string
  modules: SyllabusModule[]
  keywords: string[]
  status: 'pending' | 'generating' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface SyllabusGenerationJob {
  id: string
  course_configuration_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  retries: number
  max_retries: number
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface UserEnrollment {
  id: string
  user_id: string
  course_configuration_id: string
  enrolled_at: string
  current_module_index: number
  completed_at: string | null
  status: 'active' | 'completed' | 'dropped'
  created_at: string
  updated_at: string
}

export type ContentType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'interactive'

export interface ContentItem {
  id: string
  course_configuration_id: string
  module_index: number
  topic_index: number
  content_type: ContentType
  title: string
  description: string | null
  content_data: Record<string, any>
  file_path: string | null
  file_size: number | null
  mime_type: string | null
  order_index: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ContentGenerationJob {
  id: string
  course_configuration_id: string
  module_index: number
  topic_index: number
  content_type: ContentType
  status: 'pending' | 'processing' | 'completed' | 'failed'
  prompt: string
  result_content_id: string | null
  error_message: string | null
  retries: number
  max_retries: number
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface CourseWithDetails extends CourseConfiguration {
  syllabus?: Syllabus
  generation_job?: SyllabusGenerationJob
  enrollment_count?: number
  user_enrollment?: UserEnrollment
  content_items?: ContentItem[]
  generation_status: 'generating' | 'completed' | 'failed'
  generation_progress?: number
  estimated_completion?: string
  generation_error?: string
} 