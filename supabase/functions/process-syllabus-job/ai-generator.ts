import type { CourseConfiguration, GeneratedSyllabus } from './types.ts'

export class AIGenerator {
  private perplexityApiKey: string

  constructor() {
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!apiKey) {
      throw new Error('Perplexity API key not configured')
    }
    this.perplexityApiKey = apiKey
  }

  async generateSyllabus(courseConfig: CourseConfiguration): Promise<GeneratedSyllabus> {
    console.log('Generating syllabus with AI for course:', courseConfig.topic)

    const courseStructure = this.getCourseStructure(courseConfig.depth)
    const systemPrompt = this.buildSystemPrompt(courseStructure, courseConfig.depth)
    const userPrompt = this.buildUserPrompt(courseConfig, courseStructure)

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
    }

    console.log('Making Perplexity API request...')
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: {
          type: "json_schema",
          json_schema: { schema: syllabusSchema }
        }
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Perplexity API error:', error)
      throw new Error(`Perplexity API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    console.log('Perplexity response received, parsing...')

    try {
      return JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse Perplexity response:', content)
      throw new Error('Invalid JSON response from Perplexity')
    }
  }

  private getCourseStructure(depth: number) {
    const structures = {
      1: { modules: 3, topicsPerModule: 3 },
      2: { modules: 3, topicsPerModule: 4 },
      3: { modules: 4, topicsPerModule: 5 },
      4: { modules: 4, topicsPerModule: 5 }, // Reduced from 6 to 5
      5: { modules: 4, topicsPerModule: 5 }  // Reduced from 8 to 5, and modules from 5 to 4
    }

    return structures[depth as keyof typeof structures] || structures[3]
  }


  private buildSystemPrompt(courseStructure: any, depth: number): string {
    const depthExamples = {
      1: `Focus: Foundational concepts with everyday analogies. Example: "Variables are like labeled boxes" + simple code snippet`,
      3: `Focus: Theory + practical case studies. Include 2 real-world examples and 1 hands-on exercise`,
      5: `Focus: Current industry practices. Include research papers (post-2022) and professional tooling examples`
    };
  
    return `You're an expert course designer creating syllabi. Follow these principles:
  
  ## Pedagogical Guidelines
  1. **Progressive Flow**:
     - Module 1: Foundational principles
     - Module 2: Core applications
     - Module 3: Advanced implementations
     - Module 4: Professional preparation

2. **Practical Integration**:
   - Include 1 hands-on exercise per module
   - Add real-world case studies
   - Provide actionable next steps

3. **Depth Implementation (Level ${depth}):**
${depthExamples[depth as keyof typeof depthExamples] || depthExamples[3]}
## Output Format (JSON)
{
  "modules": [
    {
      "summary": "Module title and description",
      "topics": [
        {
          "summary": "Topic title",
          "keywords": ["3-5 relevant terms"],
          "content": "## Learning Objectives\n- Clear outcomes\n\n## Key Concepts\n- Core principles\n\n## Practical Application\n- Real-world examples"
        }
      ]
    }
  ],
  "keywords": ["5-7 course-level terms"]
}

## Special Rules
- Connect topics to prerequisite knowledge
- Include ${this.getPracticalComponents(depth)}
- Prepare for next topic progression`;
}

private getPracticalComponents(depth: number): string {
  return depth >= 3 
    ? "executable code snippets for technical topics" 
    : "interactive discussion prompts";
}

private buildUserPrompt(courseConfig: CourseConfiguration, courseStructure: any): string {
  return `Create a ${courseStructure.modules}-module syllabus for:
**Topic:** ${courseConfig.topic}
**Learning Goal:** ${courseConfig.context}
**Depth Level:** ${courseConfig.depth}/5

## Special Requests
- First module must establish foundational knowledge
- Final module should prepare for professional application
- Include 1 industry-relevant case study`;
}
}