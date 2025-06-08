import { createClient } from 'npm:@supabase/supabase-js@^2.39.1'
import { z } from 'npm:zod@^3.23.8'
import type { TavusCviRequest, TavusCviResponse, TavusApiResponse, VideoConversation } from './types.ts'
import { getReplicaId, generatePersonalizedScript } from './replica-mapping.ts'

// Request validation schema
const TavusCviRequestSchema = z.object({
  courseId: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string().min(1).max(100),
  courseDepth: z.number().int().min(1).max(5),
  conversationType: z.enum(['practice', 'exam']),
  courseTopic: z.string().min(1).max(200),
  moduleSummary: z.string().min(1).max(500)
})

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
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Tavus API key
    const tavusApiKey = Deno.env.get('TAVUS_API_KEY')
    if (!tavusApiKey) {
      throw new Error('Tavus API key not configured')
    }

    // Parse and validate request
    const requestData = await req.json()
    console.log('Received CVI initiation request:', JSON.stringify(requestData, null, 2))

    const validatedRequest = TavusCviRequestSchema.parse(requestData)
    const {
      courseId,
      userId,
      userName,
      courseDepth,
      conversationType,
      courseTopic,
      moduleSummary
    } = validatedRequest

    // Determine conversation type based on course depth
    const actualConversationType = courseDepth <= 3 ? 'practice' : 'exam'
    
    // Get appropriate replica ID
    const replicaId = getReplicaId(actualConversationType, courseTopic)
    
    // Generate personalized script
    const personalizedScript = generatePersonalizedScript(
      userName,
      courseTopic,
      moduleSummary,
      actualConversationType
    )

    console.log('Initiating Tavus CVI with:', {
      replicaId,
      conversationType: actualConversationType,
      scriptLength: personalizedScript.length
    })

    // Call Tavus API to create conversation
    const tavusResponse = await fetch('https://api.tavus.io/v2/conversations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tavusApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        replica_id: replicaId,
        conversation_name: `${actualConversationType}_${courseTopic}_${Date.now()}`,
        conversational_context: personalizedScript,
        callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/tavus-cvi-webhook`,
        properties: {
          max_call_duration: actualConversationType === 'exam' ? 1800 : 900, // 30 min for exam, 15 min for practice
          participant_left_timeout: 300, // 5 minutes
          participant_absent_timeout: 120, // 2 minutes
          enable_recording: true,
          enable_transcription: true
        }
      }),
    })

    if (!tavusResponse.ok) {
      const errorData = await tavusResponse.json()
      console.error('Tavus API error:', errorData)
      throw new Error(`Tavus API error: ${errorData.message || 'Unknown error'}`)
    }

    const tavusData: TavusApiResponse = await tavusResponse.json()
    console.log('Tavus CVI created successfully:', tavusData)

    // Store conversation record in database
    const { data: conversationRecord, error: dbError } = await supabase
      .from('video_conversations')
      .insert({
        user_id: userId,
        course_id: courseId,
        conversation_type: actualConversationType,
        tavus_replica_id: replicaId,
        tavus_conversation_id: tavusData.conversation_id,
        status: 'initiated',
        session_log: {
          created_at: new Date().toISOString(),
          initial_script: personalizedScript,
          tavus_response: tavusData
        }
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Failed to store conversation record: ${dbError.message}`)
    }

    console.log('Conversation record stored:', conversationRecord.id)

    // Return response to frontend
    const response: TavusCviResponse = {
      conversation_id: tavusData.conversation_id,
      replica_id: replicaId,
      status: 'initiated'
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error initiating Tavus CVI:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof z.ZodError ? error.errors : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})