import { createClient } from 'npm:@supabase/supabase-js';
import { z } from 'npm:zod';
// Zod schemas for validation
const SyllabusTopicSchema = z.object({
  summary: z.string().min(10).max(200),
  keywords: z.array(z.string()).min(3).max(10),
  content: z.string().min(100).max(2000)
});
const SyllabusModuleSchema = z.object({
  summary: z.string().min(20).max(300),
  topics: z.array(SyllabusTopicSchema)
});
const GeneratedSyllabusSchema = z.object({
  modules: z.array(SyllabusModuleSchema),
  keywords: z.array(z.string()).min(5).max(20)
});
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey'
};
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Parse the request body
    const { table, record, type } = await req.json();
    // Only process INSERT events on course_configuration table
    if (table !== 'course_configuration' || type !== 'INSERT') {
      return new Response(JSON.stringify({
        message: 'Event not processed'
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const courseConfig = record;
    console.log(`Generating syllabus for course: ${courseConfig.topic}`);
    // Update syllabus status to 'generating'
    await supabase.from('syllabus').update({
      status: 'generating'
    }).eq('course_configuration_id', courseConfig.id);
    // Generate syllabus using OpenAI
    const generatedSyllabus = await generateSyllabusWithAI(courseConfig);
    // Validate the generated syllabus
    let validatedSyllabus;
    try {
      validatedSyllabus = GeneratedSyllabusSchema.parse(generatedSyllabus);
    } catch (validationError) {
      console.error('Schema validation failed:', validationError);
      // Update syllabus status to 'failed' with validation error
      await supabase.from('syllabus').update({
        status: 'failed'
      }).eq('course_configuration_id', courseConfig.id);
      throw new Error(`Schema validation failed: ${validationError instanceof Error ? validationError.message : 'Unknown validation error'}`);
    }
    // Update the syllabus in the database
    const { error: updateError } = await supabase.from('syllabus').update({
      modules: validatedSyllabus.modules,
      keywords: validatedSyllabus.keywords,
      status: 'completed'
    }).eq('course_configuration_id', courseConfig.id);
    if (updateError) {
      throw new Error(`Failed to update syllabus: ${updateError.message}`);
    }
    console.log(`Successfully generated syllabus for course: ${courseConfig.topic}`);
    return new Response(JSON.stringify({
      message: 'Syllabus generated successfully',
      course_id: courseConfig.id
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error generating syllabus:', error);
    // Try to update syllabus status to 'failed' if we have the course ID
    try {
      const { record } = await req.json();
      if (record?.id) {
        const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
        await supabase.from('syllabus').update({
          status: 'failed'
        }).eq('course_configuration_id', record.id);
      }
    } catch  {
    // Ignore errors when updating status
    }
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
async function generateSyllabusWithAI(courseConfig) {
  const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
  if (!perplexityApiKey) {
    throw new Error('Perplexity API key not configured');
  }
  // Determine course structure based on depth
  const courseStructure = getCourseStructure(courseConfig.depth);
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

Content Generation Strategy:
1. Deconstruct the Request: Analyze the user's requested Topic and Context. Identify the core concepts and the user's learning goal.
2. Logical Structure: Organize the course into a logical progression. Start with foundational concepts and build towards more advanced topics. For example:
    - For a topic like "Introduction to X," start with "What is X?" and "Why is X important?".
    - For a topic like "X for beginners," focus on core features and practical first steps.
    - For a topic like "Overview of X's capabilities," each module should focus on a distinct capability. For "ElevenLabs capabilities overview", modules should cover Text-to-Speech, Speech-to-Speech, Voice Cloning, etc.
    - For advanced topics, assume foundational knowledge and dive into specific, complex areas.
3. Action-Oriented Modules: Frame module and topic summaries to be descriptive and action-oriented. Instead of a generic "Advanced Topics", use something like "Mastering Advanced Techniques in X".
4. Practical Relevance: Ensure the content is not just theoretical. The content for each topic should explain how to apply the knowledge. Use examples, and for technical topics, consider including pseudo-code or code snippets.

Quality Standards:
- Draw from the most authoritative and current sources available
- Adjust complexity and terminology to match the specified depth level
- Each topic's content should be 100-500 words of detailed markdown
- Include practical examples and real-world applications appropriate to the level
- Progressive difficulty within and across modules
- Clear learning objectives for each topic
- Relevant keywords for discoverability
- Cite or reference high-quality sources when appropriate for the depth level`;
  const userPrompt = `Create a syllabus for:
Topic: ${courseConfig.topic}
Context: ${courseConfig.context}
Depth Level: ${courseConfig.depth}/5

Generate a structured syllabus with ${courseStructure.modules} modules and ${courseStructure.topicsPerModule} topics per module. 

REMEMBER: Ensure all content meets the minimum length requirements:
- Module summaries must be at least 20 characters
- Topic summaries must be at least 10 characters
- Topic content must be at least 100 characters

Adjust the content complexity, terminology, and source sophistication to match depth level ${courseConfig.depth}. Use advanced sources but present the information at the appropriate level for the learner.`;

  // Define JSON schema for syllabus structure
  const syllabusSchema = {
    type: "object",
    properties: {
      modules: {
        type: "array",
        minItems: courseStructure.modules,
        maxItems: courseStructure.modules,
        items: {
          type: "object",
          properties: {
            summary: {
              type: "string",
              minLength: 20,
              maxLength: 300,
              description: "Module title and comprehensive description"
            },
            topics: {
              type: "array",
              minItems: courseStructure.topicsPerModule,
              maxItems: courseStructure.topicsPerModule,
              items: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    minLength: 10,
                    maxLength: 200,
                    description: "Topic title and brief description"
                  },
                  keywords: {
                    type: "array",
                    minItems: 3,
                    maxItems: 10,
                    items: {
                      type: "string"
                    },
                    description: "Keywords for the topic"
                  },
                  content: {
                    type: "string",
                    minLength: 100,
                    maxLength: 2000,
                    description: "Detailed markdown content explaining the topic"
                  }
                },
                required: ["summary", "keywords", "content"]
              }
            }
          },
          required: ["summary", "topics"]
        }
      },
      keywords: {
        type: "array",
        minItems: 5,
        maxItems: 20,
        items: {
          type: "string"
        },
        description: "Course-level keywords for searchability"
      }
    },
    required: ["modules", "keywords"]
  };

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      response_format: {
        type: "json_schema",
        json_schema: { schema: syllabusSchema }
      }
    })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Perplexity API error: ${error.error?.message || 'Unknown error'}`);
  }
  const data = await response.json();
  const content = data.choices[0].message.content;
  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse Perplexity response:', content);
    throw new Error('Invalid JSON response from Perplexity');
  }
}
function getCourseStructure(depth) {
  const structures = {
    1: {
      modules: 3,
      topicsPerModule: 3
    },
    2: {
      modules: 3,
      topicsPerModule: 4
    },
    3: {
      modules: 4,
      topicsPerModule: 5
    },
    4: {
      modules: 4,
      topicsPerModule: 6
    },
    5: {
      modules: 4,
      topicsPerModule: 8
    }
  };
  return structures[depth] || structures[3];
}
function getDepthDescription(depth) {
  const descriptions = {
    1: 'Basic overview, should be able to cover in an hour',
    2: 'Basic overview, should be able to cover in 2 hours',
    3: 'Average depth. Hobby level',
    4: 'High school / university level',
    5: 'To be used professionally'
  };
  return descriptions[depth] || descriptions[3];
}
