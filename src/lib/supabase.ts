import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

export interface CourseWithDetails extends CourseConfiguration {
  syllabus?: Syllabus
  enrollment_count?: number
  user_enrollment?: UserEnrollment
}

// Database operations
export const dbOperations = {
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

  // Get all public courses (for course discovery)
  async getAllCourses(limit = 50, offset = 0): Promise<CourseWithDetails[]> {
    const { data: courses, error: coursesError } = await supabase
      .from('course_configuration')
      .select(`
        *,
        syllabus!inner(*)
      `)
      .eq('syllabus.status', 'completed')
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

    // Combine data
    return courses.map(course => {
      const enrollmentCount = enrollmentCounts?.filter(
        ec => ec.course_configuration_id === course.id
      ).length || 0

      const userEnrollment = userEnrollments?.find(
        ue => ue.course_configuration_id === course.id
      )

      return {
        ...course,
        syllabus: course.syllabus?.[0],
        enrollment_count: enrollmentCount,
        user_enrollment: userEnrollment
      }
    })
  },

  // Get user's enrolled courses with progress
  async getUserEnrolledCourses(): Promise<CourseWithDetails[]> {
    const { data, error } = await supabase
      .from('user_enrollments')
      .select(`
        *,
        course_configuration!inner(*),
        course_configuration!inner(syllabus(*))
      `)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch enrolled courses: ${error.message}`)
    }

    if (!data) return []

    return data.map(enrollment => {
      // Handle the nested syllabus structure properly
      const syllabusData = enrollment.course_configuration?.syllabus?.[0]
      
      return {
        ...enrollment.course_configuration,
        syllabus: syllabusData,
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
        }
      }
    })
  },

  // Get a specific course by ID with syllabus (for learning page)
  async getCourseById(courseId: string): Promise<CourseWithDetails | null> {
    const { data: course, error: courseError } = await supabase
      .from('course_configuration')
      .select(`
        *,
        syllabus(*)
      `)
      .eq('id', courseId)
      .single()

    if (courseError) {
      if (courseError.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch course: ${courseError.message}`)
    }

    // Get user's enrollment if exists
    const { data: enrollment } = await supabase
      .from('user_enrollments')
      .select('*')
      .eq('course_configuration_id', courseId)
      .eq('status', 'active')
      .single()

    return {
      ...course,
      syllabus: course.syllabus?.[0],
      user_enrollment: enrollment || undefined
    }
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

  // Create initial syllabus record (will be populated by edge function)
  async createSyllabus(courseConfigurationId: string): Promise<Syllabus> {
    const { data, error } = await supabase
      .from('syllabus')
      .insert({
        course_configuration_id: courseConfigurationId,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create syllabus: ${error.message}`)
    }

    return data
  },

  // Call edge function to generate syllabus
  async generateSyllabus(courseConfiguration: CourseConfiguration): Promise<void> {
    const { error } = await supabase.functions.invoke('generate-syllabus', {
      body: {
        table: 'course_configuration',
        type: 'INSERT',
        record: courseConfiguration
      }
    })

    if (error) {
      const errorMessage = error.message || 'Network error occurred while calling the edge function. Please check your connection and try again.'
      throw new Error(`Failed to generate syllabus: ${errorMessage}`)
    }
  }
}