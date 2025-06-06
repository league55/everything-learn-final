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
  }
}