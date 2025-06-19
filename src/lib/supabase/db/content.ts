import { supabase } from '../client'
import type { ContentItem, ContentGenerationJob, ContentType } from '../types'

export const contentDb = {
  // Get content for a topic
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
} 