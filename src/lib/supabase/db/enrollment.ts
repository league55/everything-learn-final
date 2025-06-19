import { supabase } from '../client'
import type { UserEnrollment, CourseWithDetails } from '../types'

export const enrollmentDb = {
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
      let generation_progress: number | undefined

      if (syllabus) {
        if (syllabus.status === 'completed') {
          generation_status = 'completed'
        } else if (syllabus.status === 'failed') {
          generation_status = 'failed'
          generation_error = generationJob?.error_message || 'Generation failed'
        } else {
          generation_status = 'generating'
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
        generation_progress,
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

  // Update user progress in a course
  async updateCourseProgress(
    enrollmentId: string, 
    moduleIndex: number,
    completed: boolean = false
  ): Promise<UserEnrollment> {
    const updateData: any = {
      current_module_index: moduleIndex
    }

    if (completed) {
      updateData.status = 'completed'
      updateData.completed_at = new Date().toISOString()
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
} 