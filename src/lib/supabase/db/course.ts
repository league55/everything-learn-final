import { supabase } from '../client'
import type { CourseConfiguration, Syllabus, SyllabusGenerationJob, CourseWithDetails } from '../types'

export const courseDb = {
  // Create a new course configuration
  async createCourseConfiguration(data: {
    topic: string
    context: string
    depth: number
  }): Promise<CourseConfiguration> {
    const { data: result, error } = await supabase
      .from('course_configuration')
      .insert({
        topic: data.topic,
        context: data.context,
        depth: data.depth,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create course configuration: ${error.message}`)
    }

    return result
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
      let generation_progress: number | undefined

      if (syllabus) {
        if (syllabus.status === 'completed') {
          generation_status = 'completed'
        } else if (syllabus.status === 'failed') {
          generation_status = 'failed'
          generation_error = generationJob?.error_message || 'Generation failed'
        } else {
          generation_status = 'generating'
          // Calculate rough progress based on job status
          if (generationJob?.status === 'processing') {
            generation_progress = 50
          } else if (generationJob?.status === 'pending') {
            generation_progress = 10
          }
        }
      } else if (generationJob) {
        if (generationJob.status === 'failed') {
          generation_status = 'failed'
          generation_error = generationJob.error_message || 'Generation failed'
        } else {
          generation_status = 'generating'
          generation_progress = generationJob.status === 'processing' ? 50 : 10
        }
      }

      return {
        ...course,
        syllabus,
        generation_job: generationJob,
        enrollment_count: enrollmentCount,
        user_enrollment: userEnrollment,
        generation_status,
        generation_progress,
        generation_error
      }
    })
  },

  // Syllabus and generation job related DB operations can be added here...
} 