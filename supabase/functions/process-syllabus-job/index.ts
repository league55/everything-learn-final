import { createClient } from 'npm:@supabase/supabase-js'
import { z } from 'npm:zod'

// Zod schemas for validation (same as before)
const SyllabusTopicSchema = z.object({
  summary: z.string().min(10).max(200),
  keywords: z.array(z.string()).min(3).max(10),
  content: z.string().min(100).max(2000),
})

const SyllabusModuleSchema = z.object({
  summary: z.string().min(20).max(300),
  topics: z.array(SyllabusTopicSchema),
})

const GeneratedSyllabusSchema = z.object({
  modules: z.array(SyllabusModuleSchema),
  keywords: z.array(z.string()).min(5).max(20),
})

interface CourseConfiguration {
  id: string
  topic: string
  context: string
  depth: number
  user_id: string
}

interface SyllabusGenerationJob {
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

interface GeneratedSyllabus {
  modules: Array<{
    summary: string
    topics: Array<{
      summary: string
      keywords: string[]
      content: string
    }>
  }>
  keywords: string[]
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Get the raw request body for logging
    const rawBody = await req.text()
    console.log('Raw request body:', rawBody)
    
    // Parse the JSON
    let requestData
    try {
      requestData = JSON.parse(rawBody)
      console.log('Parsed request data:', JSON.stringify(requestData, null, 2))
    } catch (parseError) {
      console.error('Failed to parse request body as JSON:', parseError)
      throw new Error('Invalid JSON in request body')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let job_id: string | undefined
    let course_configuration_id: string | undefined

    // Check if this is a webhook payload (has 'record' property)
    if (requestData.record) {
      console.log('Processing webhook payload')
      console.log('Webhook record:', JSON.stringify(requestData.record, null, 2))
      
      job_id = requestData.record.id
      course_configuration_id = requestData.record.course_configuration_id
      
      console.log('Extracted from webhook - job_id:', job_id, 'course_configuration_id:', course_configuration_id)
    } else {
      // Direct function call format
      console.log('Processing direct function call')
      job_id = requestData.job_id
      course_configuration_id = requestData.course_configuration_id
      
      console.log('Extracted from direct call - job_id:', job_id, 'course_configuration_id:', course_configuration_id)
    }

    if (!job_id && !course_configuration_id) {
      console.error('Missing required parameters. Request data structure:', JSON.stringify(requestData, null, 2))
      throw new Error('Either job_id or course_configuration_id is required')
    }

    let job: SyllabusGenerationJob

    // Get the job record
    if (job_id) {
      console.log('Fetching job by ID:', job_id)
      const { data: jobData, error: jobError } = await supabase
        .from('syllabus_generation_jobs')
        .select('*')
        .eq('id', job_id)
        .single()

      if (jobError) {
        console.error('Error fetching job by ID:', jobError)
        throw new Error(`Failed to fetch job: ${jobError.message}`)
      }
      job = jobData
      console.log('Found job:', JSON.stringify(job, null, 2))
    } else {
      // Find pending job for this course
      console.log('Fetching pending job for course:', course_configuration_id)
      const { data: jobData, error: jobError } = await supabase
        .from('syllabus_generation_jobs')
        .select('*')
        .eq('course_configuration_id', course_configuration_id)
        .eq('status', 'pending')
        .single()

      if (jobError) {
        console.error('Error fetching pending job for course:', jobError)
        throw new Error(`No pending job found for course: ${jobError.message}`)
      }
      job = jobData
      console.log('Found pending job:', JSON.stringify(job, null, 2))
    }

    // Check if job is eligible for processing
    if (job.status !== 'pending') {
      console.log(`Job ${job.id} is not pending (status: ${job.status})`)
      return new Response(
        JSON.stringify({ message: `Job ${job.id} is not pending (status: ${job.status})` }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check retry limits
    if (job.retries >= job.max_retries) {
      console.log(`Job ${job.id} has exceeded maximum retries (${job.retries}/${job.max_retries})`)
      
      await supabase
        .from('syllabus_generation_jobs')
        .update({ 
          status: 'failed',
          error_message: 'Maximum retries exceeded',
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id)

      await supabase
        .from('syllabus')
        .update({ status: 'failed' })
        .eq('course_configuration_id', job.course_configuration_id)

      throw new Error(`Job ${job.id} has exceeded maximum retries`)
    }

    console.log(`Processing syllabus generation job: ${job.id}`)

    // Update job status to processing
    await supabase
      .from('syllabus_generation_jobs')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString(),
        retries: job.retries + 1
      })
      .eq('id', job.id)

    // Get course configuration
    console.log('Fetching course configuration:', job.course_configuration_id)
    const { data: courseConfig, error: courseError } = await supabase
      .from('course_configuration')
      .select('*')
      .eq('id', job.course_configuration_id)
      .single()

    if (courseError) {
      console.error('Error fetching course configuration:', courseError)
      throw new Error(`Failed to fetch course configuration: ${courseError.message}`)
    }

    console.log('Found course configuration:', JSON.stringify(courseConfig, null, 2))

    // Generate syllabus using OpenAI
    console.log('Generating syllabus with AI...')
    const generatedSyllabus = await generateSyllabusWithAI(courseConfig)

    // Validate the generated syllabus
    let validatedSyllabus
    try {
      validatedSyllabus = GeneratedSyllabusSchema.parse(generatedSyllabus)
      console.log('Syllabus validation successful')
    } catch (validationError) {
      console.error('Schema validation failed:', validationError)
      
      // Update job status to failed
      await supabase
        .from('syllabus_generation_jobs')
        .update({ 
          status: 'failed',
          error_message: `Schema validation failed: ${validationError instanceof Error ? validationError.message : 'Unknown validation error'}`,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id)

      // Update syllabus status to failed
      await supabase
        .from('syllabus')
        .update({ status: 'failed' })
        .eq('course_configuration_id', job.course_configuration_id)

      throw new Error(`Schema validation failed: ${validationError instanceof Error ? validationError.message : 'Unknown validation error'}`)
    }

    // Update the syllabus in the database
    console.log('Updating syllabus in database...')
    const { error: updateError } = await supabase
      .from('syllabus')
      .update({
        modules: validatedSyllabus.modules,
        keywords: validatedSyllabus.keywords,
        status: 'completed',
      })
      .eq('course_configuration_id', job.course_configuration_id)

    if (updateError) {
      console.error('Error updating syllabus:', updateError)
      
      // Update job as failed
      await supabase
        .from('syllabus_generation_jobs')
        .update({ 
          status: 'failed',
          error_message: `Failed to update syllabus: ${updateError.message}`,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id)

      throw new Error(`Failed to update syllabus: ${updateError.message}`)
    }

    // Mark job as completed
    console.log('Marking job as completed...')
    await supabase
      .from('syllabus_generation_jobs')
      .update({ 
        status: 'completed',
        error_message: null,
        completed_at: new Date().toISOString()
      })
      .eq('id', job.id)

    console.log(`Successfully generated syllabus for job: ${job.id}, course: ${courseConfig.topic}`)

    return new Response(
      JSON.stringify({ 
        message: 'Syllabus generated successfully',
        job_id: job.id,
        course_id: courseConfig.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error processing syllabus generation job:', error)

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function generateSyllabusWithAI(courseConfig: CourseConfiguration): Promise<GeneratedSyllabus> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  // Determine course structure based on depth
  const courseStructure = getCourseStructure(courseConfig.depth)

  const systemPrompt = `You are an expert course designer with access to advanced academic and professional sources. Create a comprehensive syllabus based on the user's requirements.

IMPORTANT: You must respond with a valid JSON object that matches this exact structure:
{
  "modules": [
    {
      "summary": "Module title and comprehensive description (MINIMUM 20 characters, MAXIMUM 300 characters)",
      "topics": [
        {
          "summary": "Topic title and brief description (minimum 10 characters, maximum 200 characters)", 
          "keywords": ["keyword1", "keyword2", "keyword3"],
          "content": "Detailed markdown content explaining the topic, including learning objectives, key concepts, and practical applications (minimum 100 characters, maximum 2000 characters)"
        }
      ]
    }
  ],
  "keywords": ["course-level", "keywords", "for", "searchability"]
}

CRITICAL LENGTH REQUIREMENTS:
- Module summary: MUST be at least 20 characters and at most 300 characters
- Topic summary: MUST be at least 10 characters and at most 200 characters  
- Topic content: MUST be at least 100 characters and at most 2000 characters
- Keywords array: MUST have 5-20 course-level keywords
- Topic keywords: MUST have 3-10 keywords per topic

Course Structure Requirements:
- ${courseStructure.modules} modules total
- ${courseStructure.topicsPerModule} topics per module
- Content depth level: ${courseConfig.depth}/5 (${getDepthDescription(courseConfig.depth)})

Content Guidelines Based on Depth Level:
- Depth 1: Use accessible language, focus on fundamental concepts, provide simple examples
- Depth 2: Include more detailed explanations, introduce intermediate concepts, provide practical applications
- Depth 3: Present comprehensive coverage, include analytical thinking, provide real-world case studies
- Depth 4: Use advanced terminology, reference current research, include complex problem-solving
- Depth 5: Reference academic literature, include cutting-edge developments, focus on professional application

Quality Standards:
- Draw from the most authoritative and current sources available
- Adjust complexity and terminology to match the specified depth level
- Each topic's content should be 100-500 words of detailed markdown
- Include practical examples and real-world applications appropriate to the level
- Progressive difficulty within and across modules
- Clear learning objectives for each topic
- Relevant keywords for discoverability
- Cite or reference high-quality sources when appropriate for the depth level`

  const userPrompt = `Create a syllabus for:
Topic: ${courseConfig.topic}
Context: ${courseConfig.context}
Depth Level: ${courseConfig.depth}/5

Generate a structured syllabus with ${courseStructure.modules} modules and ${courseStructure.topicsPerModule} topics per module. 

REMEMBER: Ensure all content meets the minimum length requirements:
- Module summaries must be at least 20 characters
- Topic summaries must be at least 10 characters
- Topic content must be at least 100 characters

Adjust the content complexity, terminology, and source sophistication to match depth level ${courseConfig.depth}. Use advanced sources but present the information at the appropriate level for the learner.`

  console.log('Making OpenAI API request...')
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('OpenAI API error:', error)
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  console.log('OpenAI response received, parsing...')

  try {
    return JSON.parse(content)
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', content)
    throw new Error('Invalid JSON response from OpenAI')
  }
}

function getCourseStructure(depth: number) {
  const structures = {
    1: {
      modules: 3,
      topicsPerModule: 3,
    },
    2: {
      modules: 3,
      topicsPerModule: 4,
    },
    3: {
      modules: 4,
      topicsPerModule: 5,
    },
    4: {
      modules: 4,
      topicsPerModule: 6,
    },
    5: {
      modules: 5,
      topicsPerModule: 8,
    }
  }

  return structures[depth as keyof typeof structures] || structures[3]
}

function getDepthDescription(depth: number): string {
  const descriptions = {
    1: 'Basic overview, should be able to cover in an hour',
    2: 'Basic overview, should be able to cover in 2 hours',
    3: 'Average depth. Hobby level',
    4: 'High school / university level',
    5: 'To be used professionally'
  }

  return descriptions[depth as keyof typeof descriptions] || descriptions[3]
}