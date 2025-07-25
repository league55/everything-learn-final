import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Dynamic domain detection for cookie storage
function getCookieDomain(): string {
  if (typeof window === 'undefined') return ''
  
  const hostname = window.location.hostname
  console.log('Current hostname:', hostname)
  
  // For localhost and IP addresses, don't set domain
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    console.log('Using localhost/IP - no domain set')
    return ''
  }
  
  // For bolt.new domains, don't set domain to avoid cross-origin issues
  if (hostname.includes('bolt.new')) {
    console.log('Using bolt.new - no domain set to avoid cross-origin issues')
    return ''
  }
  
  // For everythinglearn.online and its subdomains
  if (hostname.includes('everythinglearn.online')) {
    console.log('Using everythinglearn.online domain')
    return '.everythinglearn.online'
  }
  
  // For other domains, don't set domain by default to be safe
  console.log('Using default - no domain set for safety')
  return ''
}

function getCookieAttributes(): string {
  const domain = getCookieDomain()
  const isSecure = window.location.protocol === 'https:'
  
  let attributes = 'path=/; samesite=lax; max-age=31536000' // 1 year
  
  if (domain) {
    attributes += `; domain=${domain}`
  }
  
  if (isSecure) {
    attributes += '; secure'
  }
  
  return attributes
}

// Create a custom storage implementation with better error handling
const customStorage = {
  getItem: (key: string) => {
    try {
      console.log('Getting cookie:', key)
      
      // Fallback to localStorage if cookies fail
      if (typeof document === 'undefined') {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key)
        }
        return null
      }
      
      const cookies = document.cookie.split(';')
      const cookie = cookies.find(c => c.trim().startsWith(`${key}=`))
      let value = cookie ? decodeURIComponent(cookie.split('=')[1]) : null
      
      // If cookie not found, try localStorage as fallback
      if (!value && typeof localStorage !== 'undefined') {
        value = localStorage.getItem(key)
        console.log('Cookie not found, trying localStorage:', value ? 'exists' : 'null')
      }
      
      console.log('Final cookie value:', value ? 'exists' : 'null')
      return value
    } catch (error) {
      console.error('Error getting cookie:', error)
      
      // Fallback to localStorage
      try {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key)
        }
      } catch (localStorageError) {
        console.error('Error getting from localStorage:', localStorageError)
      }
      
      return null
    }
  },
  
  setItem: (key: string, value: string) => {
    try {
      console.log('Setting cookie:', key)
      const attributes = getCookieAttributes()
      
      console.log('Cookie attributes:', attributes)
      document.cookie = `${key}=${encodeURIComponent(value)}; ${attributes}`
      
      // Also store in localStorage as backup
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value)
        console.log('Also stored in localStorage as backup')
      }
    } catch (error) {
      console.error('Error setting cookie:', error)
      
      // Fallback to localStorage
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value)
          console.log('Fallback: stored in localStorage')
        }
      } catch (localStorageError) {
        console.error('Error setting localStorage:', localStorageError)
      }
    }
  },
  
  removeItem: (key: string) => {
    try {
      console.log('Removing cookie:', key)
      const domain = getCookieDomain()
      let attributes = 'path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax'
      
      if (domain) {
        attributes += `; domain=${domain}`
      }
      
      if (window.location.protocol === 'https:') {
        attributes += '; secure'
      }
      
      console.log('Cookie removal attributes:', attributes)
      document.cookie = `${key}=; ${attributes}`
      
      // Also remove from localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key)
        console.log('Also removed from localStorage')
      }
    } catch (error) {
      console.error('Error removing cookie:', error)
      
      // Fallback to localStorage removal
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key)
          console.log('Fallback: removed from localStorage')
        }
      } catch (localStorageError) {
        console.error('Error removing from localStorage:', localStorageError)
      }
    }
  }
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-auth-token',
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for our database schema
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
  full_content_path?: string // Added for Phase 3
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

// New content system types
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

// Storage bucket names
export const STORAGE_BUCKETS = {
  IMAGES: 'course-images',
  VIDEOS: 'course-videos',
  AUDIO: 'course-audio',
  DOCUMENTS: 'course-documents',
  INTERACTIVE: 'course-interactive'
} as const

// Import certificate operations
import { certificateOperations } from './supabase/db/certificates'

// Database operations
export const dbOperations = {
  // Create a new course configuration - FIXED METHOD
  async createCourseConfiguration(data: {
    topic: string
    context: string
    depth: number
  }): Promise<CourseConfiguration> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error(`Failed to get current user: ${userError.message}`)
      }
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('Creating course configuration for user:', user.id)

      // Insert new course configuration
      const { data: result, error } = await supabase
        .from('course_configuration')
        .insert({
          topic: data.topic.trim(),
          context: data.context.trim(),
          depth: data.depth,
          user_id: user.id
        })
        .select('*')
        .single()

      if (error) {
        console.error('Database error creating course configuration:', error)
        throw new Error(`Failed to create course configuration: ${error.message}`)
      }

      if (!result) {
        throw new Error('Failed to create course configuration: No data returned')
      }

      console.log('Course configuration created successfully:', result.id)
      return result

    } catch (error) {
      console.error('Error in createCourseConfiguration:', error)
      throw error
    }
  },

  // Get course configurations for the current user
  async getCourseConfigurations(): Promise<CourseConfiguration[]> {
    const { data, error } = await supabase
      .from('course_configuration')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch course configurations: ${error.message}`)
    }

    return data || []
  },

  // Get course by ID (needed for certificate generation)
  async getCourseById(courseId: string): Promise<CourseConfiguration & { syllabus?: Syllabus } | null> {
    const { data: course, error: courseError } = await supabase
      .from('course_configuration')
      .select('*')
      .eq('id', courseId)
      .single()

    if (courseError) {
      if (courseError.code === 'PGRST116') return null
      throw new Error(`Failed to fetch course: ${courseError.message}`)
    }

    // Also fetch syllabus
    const { data: syllabus } = await supabase
      .from('syllabus')
      .select('*')
      .eq('course_configuration_id', courseId)
      .single()

    return {
      ...course,
      syllabus: syllabus || undefined
    }
  },

  // Get all courses (including generating ones)
  async getAllCourses(limit = 50, offset = 0): Promise<CourseWithDetails[]> {
    const { data: courses, error: coursesError } = await supabase
      .from('course_configuration')
      .select(`
        *,
        syllabus(*),
        syllabus_generation_jobs(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (coursesError) {
      throw new Error(`Failed to fetch courses: ${coursesError.message}`)
    }

    if (!courses) return []

    // Get enrollment counts for each course
    const courseIds = courses.map(course => course.id)
    const { data: enrollmentCounts, error: countError } = await supabase
      .from('user_enrollments')
      .select('course_configuration_id')
      .in('course_configuration_id', courseIds)
      .eq('status', 'active')

    if (countError) {
      console.warn('Failed to fetch enrollment counts:', countError)
    }

    // Get current user's enrollments for these courses
    const { data: userEnrollments, error: enrollmentError } = await supabase
      .from('user_enrollments')
      .select('*')
      .in('course_configuration_id', courseIds)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: false })

    if (enrollmentError) {
      console.warn('Failed to fetch user enrollments:', enrollmentError)
    }

    // Combine data and determine generation status
    return courses.map(course => {
      const enrollmentCount = enrollmentCounts?.filter(
        ec => ec.course_configuration_id === course.id
      ).length || 0

      const userEnrollment = userEnrollments?.find(
        ue => ue.course_configuration_id === course.id
      )

      const syllabus = course.syllabus
      const generationJob = course.syllabus_generation_jobs

      // Determine generation status
      let generation_status: 'generating' | 'completed' | 'failed' = 'generating'
      let generation_error: string | undefined

      if (syllabus) {
        if (syllabus.status === 'completed') {
          generation_status = 'completed'
        } else if (syllabus.status === 'failed') {
          generation_status = 'failed'
          generation_error = generationJob?.error_message || 'Generation failed'
          
          // Check if it's a content violation and provide user-friendly message
          if (generationJob?.error_message?.includes('CONTENT_VIOLATION')) {
            const match = generationJob.error_message.match(/CONTENT_VIOLATION: (.+)/)
            generation_error = match ? match[1] : 'This topic doesn\'t meet our content guidelines.'
          }
        } else {
          generation_status = 'generating'
        }
      } else if (generationJob) {
        if (generationJob.status === 'failed') {
          generation_status = 'failed'
          generation_error = generationJob.error_message || 'Generation failed'
          
          // Check if it's a content violation and provide user-friendly message
          if (generationJob.error_message?.includes('CONTENT_VIOLATION')) {
            const match = generationJob.error_message.match(/CONTENT_VIOLATION: (.+)/)
            generation_error = match ? match[1] : 'This topic doesn\'t meet our content guidelines.'
          }
        } else {
          generation_status = 'generating'
        }
      }

      return {
        ...course,
        syllabus,
        generation_job: generationJob,
        enrollment_count: enrollmentCount,
        user_enrollment: userEnrollment,
        generation_status,
        generation_error
      }
    })
  },

  // Get only completed courses (for backward compatibility)
  async getCompletedCourses(limit = 50, offset = 0): Promise<CourseWithDetails[]> {
    const allCourses = await this.getAllCourses(limit, offset)
    return allCourses.filter(course => course.generation_status === 'completed')
  },

  // Get only generating courses
  async getGeneratingCourses(limit = 50, offset = 0): Promise<CourseWithDetails[]> {
    const allCourses = await this.getAllCourses(limit, offset)
    return allCourses.filter(course => course.generation_status === 'generating')
  },

  // Get course generation status
  async getCourseGenerationStatus(courseId: string): Promise<{
    status: 'generating' | 'completed' | 'failed'
    progress?: number
    error?: string
  }> {
    const { data: syllabus } = await supabase
      .from('syllabus')
      .select('status')
      .eq('course_configuration_id', courseId)
      .single()

    const { data: job } = await supabase
      .from('syllabus_generation_jobs')
      .select('status, error_message')
      .eq('course_configuration_id', courseId)
      .single()

    if (syllabus?.status === 'completed') {
      return { status: 'completed' }
    } else if (syllabus?.status === 'failed' || job?.status === 'failed') {
      let error = job?.error_message || 'Generation failed'
      
      // Check if it's a content violation and provide user-friendly message
      if (job?.error_message?.includes('CONTENT_VIOLATION')) {
        const match = job.error_message.match(/CONTENT_VIOLATION: (.+)/)
        error = match ? match[1] : 'This topic doesn\'t meet our content guidelines.'
      }
      
      return { 
        status: 'failed', 
        error 
      }
    } else {
      return { 
        status: 'generating', 
        progress: job?.status === 'processing' ? 50 : 10 
      }
    }
  },

  // Retry course generation
  async retryCourseGeneration(courseId: string): Promise<SyllabusGenerationJob> {
    // Get the existing job
    const { data: existingJob, error: fetchError } = await supabase
      .from('syllabus_generation_jobs')
      .select('*')
      .eq('course_configuration_id', courseId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch existing job: ${fetchError.message}`)
    }

    // Check if we can retry
    if (existingJob.retries >= existingJob.max_retries) {
      throw new Error(`Maximum retries (${existingJob.max_retries}) exceeded for this job`)
    }

    // Reset job to pending status for retry
    const { data: retriedJob, error: retryError } = await supabase
      .from('syllabus_generation_jobs')
      .update({
        status: 'pending',
        error_message: null,
        started_at: null,
        completed_at: null
      })
      .eq('id', existingJob.id)
      .select()
      .single()

    if (retryError) {
      throw new Error(`Failed to retry generation job: ${retryError.message}`)
    }

    // Also update syllabus status
    await supabase
      .from('syllabus')
      .update({ status: 'generating' })
      .eq('course_configuration_id', courseId)

    return retriedJob
  },

  // Get user's enrolled courses with progress (including generating ones)
  async getUserEnrolledCourses(): Promise<CourseWithDetails[]> {
    const { data, error } = await supabase
      .from('user_enrollments')
      .select(`
        *,
        course_configuration!inner(*),
        syllabus:course_configuration!inner(syllabus(*)),
        generation_jobs:course_configuration!inner(syllabus_generation_jobs(*))
      `)
      .in('status', ['active', 'completed'])
      .order('enrolled_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch enrolled courses: ${error.message}`)
    }

    if (!data) return []

    return data.map(enrollment => {
      const syllabus = enrollment.syllabus?.syllabus
      const generationJob = enrollment.generation_jobs?.syllabus_generation_jobs

      // Determine generation status
      let generation_status: 'generating' | 'completed' | 'failed' = 'generating'
      let generation_error: string | undefined

      if (syllabus) {
        if (syllabus.status === 'completed') {
          generation_status = 'completed'
        } else if (syllabus.status === 'failed') {
          generation_status = 'failed'
          generation_error = generationJob?.error_message || 'Generation failed'
          
          // Check if it's a content violation and provide user-friendly message
          if (generationJob?.error_message?.includes('CONTENT_VIOLATION')) {
            const match = generationJob.error_message.match(/CONTENT_VIOLATION: (.+)/)
            generation_error = match ? match[1] : 'This topic doesn\'t meet our content guidelines.'
          }
        } else {
          generation_status = 'generating'
        }
      } else if (generationJob) {
        if (generationJob.status === 'failed') {
          generation_status = 'failed'
          generation_error = generationJob.error_message || 'Generation failed'
          
          // Check if it's a content violation and provide user-friendly message
          if (generationJob.error_message?.includes('CONTENT_VIOLATION')) {
            const match = generationJob.error_message.match(/CONTENT_VIOLATION: (.+)/)
            generation_error = match ? match[1] : 'This topic doesn\'t meet our content guidelines.'
          }
        } else {
          generation_status = 'generating'
        }
      }

      return {
        ...enrollment.course_configuration,
        syllabus,
        generation_job: generationJob,
        user_enrollment: {
          id: enrollment.id,
          user_id: enrollment.user_id,
          course_configuration_id: enrollment.course_configuration_id,
          enrolled_at: enrollment.enrolled_at,
          current_module_index: enrollment.current_module_index,
          completed_at: enrollment.completed_at,
          status: enrollment.status,
          created_at: enrollment.created_at,
          updated_at: enrollment.updated_at
        },
        generation_status,
        generation_error
      }
    })
  },

  // Enroll user in a course
  async enrollInCourse(courseConfigurationId: string): Promise<UserEnrollment> {
    const { data, error } = await supabase
      .from('user_enrollments')
      .insert({
        course_configuration_id: courseConfigurationId,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to enroll in course: ${error.message}`)
    }

    return data
  },

  // Update user progress in a course with optional examination results
  async updateCourseProgress(
    enrollmentId: string, 
    moduleIndex: number,
    completed: boolean = false,
    examinationResults?: any
  ): Promise<UserEnrollment> {
    const updateData: any = {
      current_module_index: moduleIndex
    }

    if (completed) {
      updateData.status = 'completed'
      updateData.completed_at = new Date().toISOString()

      // If examination results provided and course is completed, trigger certificate generation
      if (examinationResults) {
        try {
          // Get enrollment details to get course and student info
          const { data: enrollment } = await supabase
            .from('user_enrollments')
            .select('user_id, course_configuration_id')
            .eq('id', enrollmentId)
            .single()

          if (enrollment) {
            // Import certificate API dynamically to avoid circular dependencies
            const { getCertificateAPI } = await import('@/blockchain/api/certificate-api')
            const certificateAPI = await getCertificateAPI()
            
            // Generate certificate
            await certificateAPI.onExaminationCompletion(
              enrollment.user_id,
              enrollment.course_configuration_id,
              examinationResults
            )
            
            console.log('Certificate generated successfully for course completion')
          }
        } catch (certError) {
          console.error('Failed to generate certificate:', certError)
          // Don't fail the course completion, just log the error
        }
      }
    }

    const { data, error } = await supabase
      .from('user_enrollments')
      .update(updateData)
      .eq('id', enrollmentId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update course progress: ${error.message}`)
    }

    return data
  },

  // Get syllabus for a course configuration
  async getSyllabus(courseConfigurationId: string): Promise<Syllabus | null> {
    const { data, error } = await supabase
      .from('syllabus')
      .select('*')
      .eq('course_configuration_id', courseConfigurationId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to fetch syllabus: ${error.message}`)
    }

    return data
  },

  // Get syllabus generation job status
  async getSyllabusGenerationJob(courseConfigurationId: string): Promise<SyllabusGenerationJob | null> {
    const { data, error } = await supabase
      .from('syllabus_generation_jobs')
      .select('*')
      .eq('course_configuration_id', courseConfigurationId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to fetch generation job: ${error.message}`)
    }

    return data
  },

  // Create initial syllabus record and enqueue generation job
  async createSyllabus(courseConfigurationId: string): Promise<{ syllabus: Syllabus; job: SyllabusGenerationJob }> {
    // Start a transaction-like operation
    try {
      // First, create the initial syllabus record
      const { data: syllabusData, error: syllabusError } = await supabase
        .from('syllabus')
        .insert({
          course_configuration_id: courseConfigurationId,
          status: 'pending'
        })
        .select()
        .single()

      if (syllabusError) {
        throw new Error(`Failed to create syllabus: ${syllabusError.message}`)
      }

      // Then, enqueue the generation job
      const { data: jobData, error: jobError } = await supabase
        .from('syllabus_generation_jobs')
        .insert({
          course_configuration_id: courseConfigurationId,
          status: 'pending'
        })
        .select()
        .single()

      if (jobError) {
        // If job creation fails, we should clean up the syllabus record
        await supabase
          .from('syllabus')
          .delete()
          .eq('id', syllabusData.id)
        
        throw new Error(`Failed to enqueue generation job: ${jobError.message}`)
      }

      // Update syllabus status to 'generating' since job is now queued
      const { data: updatedSyllabus, error: updateError } = await supabase
        .from('syllabus')
        .update({ status: 'generating' })
        .eq('id', syllabusData.id)
        .select()
        .single()

      if (updateError) {
        console.warn('Failed to update syllabus status to generating:', updateError)
      }

      return {
        syllabus: updatedSyllabus || syllabusData,
        job: jobData
      }

    } catch (error) {
      console.error('Error in createSyllabus:', error)
      throw error
    }
  },

  // Retry failed syllabus generation
  async retrySyllabusGeneration(courseConfigurationId: string): Promise<SyllabusGenerationJob> {
    // Get the existing job
    const { data: existingJob, error: fetchError } = await supabase
      .from('syllabus_generation_jobs')
      .select('*')
      .eq('course_configuration_id', courseConfigurationId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch existing job: ${fetchError.message}`)
    }

    // Check if we can retry
    if (existingJob.retries >= existingJob.max_retries) {
      throw new Error(`Maximum retries (${existingJob.max_retries}) exceeded for this job`)
    }

    // Reset job to pending status for retry
    const { data: retriedJob, error: retryError } = await supabase
      .from('syllabus_generation_jobs')
      .update({
        status: 'pending',
        error_message: null,
        started_at: null,
        completed_at: null
      })
      .eq('id', existingJob.id)
      .select()
      .single()

    if (retryError) {
      throw new Error(`Failed to retry generation job: ${retryError.message}`)
    }

    // Also update syllabus status
    await supabase
      .from('syllabus')
      .update({ status: 'generating' })
      .eq('course_configuration_id', courseConfigurationId)

    return retriedJob
  },

  // Content operations
  async getTopicContent(
    courseId: string,
    moduleIndex: number,
    topicIndex: number
  ): Promise<ContentItem[]> {
    const { data, error } = await supabase
      .rpc('get_topic_content', {
        p_course_id: courseId,
        p_module_index: moduleIndex,
        p_topic_index: topicIndex
      })

    if (error) {
      throw new Error(`Failed to fetch topic content: ${error.message}`)
    }

    return data || []
  },

  async createContentItem(contentItem: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>): Promise<ContentItem> {
    const { data, error } = await supabase
      .from('content_items')
      .insert(contentItem)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create content item: ${error.message}`)
    }

    return data
  },

  async updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
    const { data, error } = await supabase
      .from('content_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update content item: ${error.message}`)
    }

    return data
  },

  async deleteContentItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete content item: ${error.message}`)
    }
  },

  async createContentGenerationJob(
    courseId: string,
    moduleIndex: number,
    topicIndex: number,
    contentType: ContentType,
    prompt: string
  ): Promise<string> {
    const { data, error } = await supabase
      .rpc('create_content_generation_job', {
        p_course_id: courseId,
        p_module_index: moduleIndex,
        p_topic_index: topicIndex,
        p_content_type: contentType,
        p_prompt: prompt
      })

    if (error) {
      throw new Error(`Failed to create content generation job: ${error.message}`)
    }

    return data
  },

  async getContentGenerationJobs(courseId: string): Promise<ContentGenerationJob[]> {
    const { data, error } = await supabase
      .from('content_generation_jobs')
      .select('*')
      .eq('course_configuration_id', courseId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch content generation jobs: ${error.message}`)
    }

    return data || []
  },

  // Get content generation jobs for specific topic
  async getTopicContentGenerationJobs(
    courseId: string,
    moduleIndex: number,
    topicIndex: number
  ): Promise<ContentGenerationJob[]> {
    const { data, error } = await supabase
      .from('content_generation_jobs')
      .select('*')
      .eq('course_configuration_id', courseId)
      .eq('module_index', moduleIndex)
      .eq('topic_index', topicIndex)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch topic content generation jobs: ${error.message}`)
    }

    return data || []
  },

  // Trigger full content generation for a topic
  async triggerFullContentGeneration(
    courseId: string,
    moduleIndex: number,
    topicIndex: number
  ): Promise<string> {
    // Create a content generation job for text content
    const prompt = `Generate comprehensive learning content for this topic. Include detailed explanations, examples, and practical applications appropriate for the course depth level.`
    
    const jobId = await this.createContentGenerationJob(
      courseId,
      moduleIndex,
      topicIndex,
      'text',
      prompt
    )

    // Invoke the edge function to process the job
    try {
      const { data, error } = await supabase.functions.invoke('process-content-job', {
        body: {
          job_id: jobId,
          course_configuration_id: courseId,
          module_index: moduleIndex,
          topic_index: topicIndex,
          content_type: 'text'
        }
      })

      if (error) {
        console.warn('Failed to invoke edge function:', error)
        // Job is still created, it will be processed by the trigger
      }
    } catch (invokeError) {
      console.warn('Failed to invoke edge function:', invokeError)
      // Job is still created, it will be processed by the trigger
    }

    return jobId
  },

  // Get full content from storage
  async getFullContent(path: string): Promise<string> {
    try {
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`)
      }
      return await response.text()
    } catch (error) {
      throw new Error(`Failed to fetch full content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  // File upload operations
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: { cacheControl?: string; upsert?: boolean }
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options)

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    return data.path
  },

  async getFileUrl(bucket: string, path: string): Promise<string> {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  },

  // Certificate operations - expose certificate operations from the separate module
  ...certificateOperations,

  // Add supabase client for direct access when needed
  supabase
}