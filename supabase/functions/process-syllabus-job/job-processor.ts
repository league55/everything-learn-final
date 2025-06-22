import { DatabaseService } from './database.ts'
import { AIGenerator } from './ai-generator.ts'
import { ModerationService } from './moderation.ts'
import { validateSyllabus } from './validation.ts'
import type { SyllabusGenerationJob } from './types.ts'

export class JobProcessor {
  private db: DatabaseService
  private ai: AIGenerator
  private moderation: ModerationService

  constructor() {
    this.db = new DatabaseService()
    this.ai = new AIGenerator()
    this.moderation = new ModerationService()
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

      // CONTENT MODERATION: Validate course content before AI generation
      console.log('Performing content moderation check...')
      const moderationResult = await this.moderation.validateCourseContent(
        courseConfig.topic, 
        courseConfig.context
      )

      if (!moderationResult.safe) {
        const errorMessage = moderationResult.reason || 'Content violates our guidelines'
        console.log('Content moderation failed:', errorMessage)
        
        // Mark job as failed with specific error
        await this.db.updateJobStatus(job.id, 'failed', {
          errorMessage: `CONTENT_VIOLATION: ${errorMessage}`,
          completedAt: new Date().toISOString()
        })

        // Update syllabus status to failed
        await this.db.updateSyllabusStatus(job.course_configuration_id, 'failed')

        throw new Error(`CONTENT_VIOLATION: ${errorMessage}`)
      }

      console.log('Content moderation passed, proceeding with generation...')

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

    } catch (error) {
      console.error('Error during job processing:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Check if this is a content violation error
      const isContentViolation = errorMessage.includes('CONTENT_VIOLATION')
      
      // Update job as failed
      await this.db.updateJobStatus(job.id, 'failed', {
        errorMessage,
        completedAt: new Date().toISOString()
      })

      // Update syllabus status to failed
      await this.db.updateSyllabusStatus(job.course_configuration_id, 'failed')

      // Re-throw the error with appropriate context
      if (isContentViolation) {
        throw new Error(errorMessage) // Keep the content violation message as-is
      } else {
        throw error
      }
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