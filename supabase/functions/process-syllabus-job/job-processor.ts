import { DatabaseService } from './database.ts'
import { AIGenerator } from './ai-generator.ts'
import { validateSyllabus } from './validation.ts'
import type { SyllabusGenerationJob } from './types.ts'

export class JobProcessor {
  private db: DatabaseService
  private ai: AIGenerator

  constructor() {
    this.db = new DatabaseService()
    this.ai = new AIGenerator()
  }

  async processJob(jobId?: string, courseConfigurationId?: string): Promise<void> {
    let job: SyllabusGenerationJob

    // Get the job record
    if (jobId) {
      job = await this.db.getJobById(jobId)
    } else if (courseConfigurationId) {
      job = await this.db.getPendingJobForCourse(courseConfigurationId)
    } else {
      throw new Error('Either job_id or course_configuration_id is required')
    }

    // Validate job eligibility
    await this.validateJobEligibility(job)

    console.log(`Processing syllabus generation job: ${job.id}`)

    try {
      // Update job status to processing
      await this.db.updateJobStatus(job.id, 'processing', {
        startedAt: new Date().toISOString(),
        retries: job.retries + 1
      })

      // Get course configuration
      const courseConfig = await this.db.getCourseConfiguration(job.course_configuration_id)

      // Generate syllabus using AI
      const generatedSyllabus = await this.ai.generateSyllabus(courseConfig)

      // Validate the generated syllabus
      const validatedSyllabus = validateSyllabus(generatedSyllabus)
      console.log('Syllabus validation successful')

      // Update the syllabus in the database
      await this.db.updateSyllabus(job.course_configuration_id, validatedSyllabus)

      // Mark job as completed
      await this.db.updateJobStatus(job.id, 'completed', {
        errorMessage: null,
        completedAt: new Date().toISOString()
      })

      console.log(`Successfully generated syllabus for job: ${job.id}, course: ${courseConfig.topic}`)

      // Schedule content generation for the first module
      await this.scheduleFirstModuleContentGeneration(job.course_configuration_id, validatedSyllabus)

    } catch (error) {
      console.error('Error during job processing:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Update job as failed
      await this.db.updateJobStatus(job.id, 'failed', {
        errorMessage,
        completedAt: new Date().toISOString()
      })

      // Update syllabus status to failed
      await this.db.updateSyllabusStatus(job.course_configuration_id, 'failed')

      throw error
    }
  }

  private async scheduleFirstModuleContentGeneration(courseId: string, syllabus: any): Promise<void> {
    console.log('Scheduling content generation for first module of course:', courseId)

    try {
      if (!syllabus.modules || syllabus.modules.length === 0) {
        console.log('No modules found in syllabus, skipping content generation')
        return
      }

      const firstModule = syllabus.modules[0]
      if (!firstModule.topics || firstModule.topics.length === 0) {
        console.log('No topics found in first module, skipping content generation')
        return
      }

      // Create content generation jobs for each topic in the first module
      const contentJobs = []
      for (let topicIndex = 0; topicIndex < firstModule.topics.length; topicIndex++) {
        const topic = firstModule.topics[topicIndex]
        
        const prompt = `Generate comprehensive learning content for this topic: ${topic.summary}

Topic context: ${topic.content}
Keywords: ${topic.keywords.join(', ')}

Create detailed educational content that includes:
- Clear explanations of key concepts
- Practical examples and applications
- Learning objectives
- Real-world use cases
- Interactive elements where appropriate

The content should be engaging, well-structured, and appropriate for the course depth level.`

        // Create content generation job
        const jobId = await this.db.createContentGenerationJob(courseId, 0, topicIndex, prompt)
        contentJobs.push(jobId)
      }

      console.log(`Successfully scheduled ${contentJobs.length} content generation jobs for first module`)

    } catch (error) {
      console.error('Error scheduling first module content generation:', error)
      // Don't throw error - syllabus generation was successful, content generation is supplementary
    }
  }

  private async validateJobEligibility(job: SyllabusGenerationJob): Promise<void> {
    // Check if job is eligible for processing
    if (job.status !== 'pending') {
      const message = `Job ${job.id} is not pending (status: ${job.status})`
      console.log(message)
      throw new Error(message)
    }

    // Check retry limits
    if (job.retries >= job.max_retries) {
      const message = `Job ${job.id} has exceeded maximum retries (${job.retries}/${job.max_retries})`
      console.log(message)
      
      await this.db.updateJobStatus(job.id, 'failed', {
        errorMessage: 'Maximum retries exceeded',
        completedAt: new Date().toISOString()
      })

      await this.db.updateSyllabusStatus(job.course_configuration_id, 'failed')

      throw new Error(message)
    }
  }
}