import { validateContentLength } from './validation.ts';
export class AIGenerator {
  openaiApiKey;
  constructor(){
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      throw new Error('Perplexity API key not configured');
    }
    this.openaiApiKey = apiKey;
  }
  async generateContent(courseConfig, syllabus, moduleIndex, topicIndex, contentType, prompt, existingContent = []) {
    console.log('Generating content with AI for:', {
      course: courseConfig.topic,
      moduleIndex,
      topicIndex,
      contentType
    });
    const { module, topic } = this.getTopicFromSyllabus(syllabus, moduleIndex, topicIndex);
    const systemPrompt = this.buildSystemPrompt(courseConfig, contentType);
    const userPrompt = this.buildUserPrompt(courseConfig, module, topic, contentType, prompt, existingContent);
    // Check content length for context window management
    const totalPromptLength = systemPrompt.length + userPrompt.length;
    if (!validateContentLength(systemPrompt + userPrompt, 12000)) {
      console.warn('Prompt too long, truncating context...');
      // Truncate existing content context if needed
      const truncatedUserPrompt = this.truncateUserPrompt(userPrompt, 8000);
      return await this.callOpenAI(systemPrompt, truncatedUserPrompt);
    }
    return await this.callOpenAI(systemPrompt, userPrompt);
  }
  getTopicFromSyllabus(syllabus, moduleIndex, topicIndex) {
    if (!syllabus.modules || moduleIndex >= syllabus.modules.length) {
      throw new Error(`Module index ${moduleIndex} out of range`);
    }
    const module = syllabus.modules[moduleIndex];
    if (!module.topics || topicIndex >= module.topics.length) {
      throw new Error(`Topic index ${topicIndex} out of range in module ${moduleIndex}`);
    }
    return {
      module,
      topic: module.topics[topicIndex]
    };
  }
  buildSystemPrompt(courseConfig, contentType) {
    const depthExamples = {
      1: `Explain like teaching a complete beginner. Use everyday analogies (e.g., "Variables are like labeled boxes"). Include 1 simple code snippet.`,
      3: `For intermediate learners: Combine theory with practical case studies. Include 2-3 real-world examples and 1 hands-on exercise.`,
      5: `Professional level: Focus on current industry practices. Include research papers (post-2022) and professional tooling examples.`
    };
  
    return `You're an expert instructional designer creating ${contentType} content. Follow these principles:
  
  ## Pedagogical Guidelines
  1. **Progressive Difficulty**:
     - Module 1: Foundational principles
     - Module 2: Core applications
     - Module 3: Advanced implementations
  
  2. **Practical Focus**:
     - Include ${this.getPracticalComponents(contentType)}
     - Add real-world case studies
     - Provide actionable next steps
  
  3. **Depth Adaptation (Level ${courseConfig.depth}):**
  ${depthExamples[courseConfig.depth] || depthExamples[3]}
  
  ## Output Format (JSON)
  {
    "title": "Concise descriptive title",
    "content": "Markdown formatted educational material",
    "citations": [
      {
        "type": "source_type",
        "title": "Source Title",
        "url": "https://example.com",
        "relevance": "Specific justification"
      }
    ]
  }
  
  ## Special Rules
  - Citations only when referencing external concepts
  - Practical components must match depth level
  - Use real examples over theoretical explanations`;
  }

  getPracticalComponents(contentType) {
    const components = {
      text: "executable code snippets",
      video: "interactive pause points",
      interactive: "hands-on exercises"
    };
    return components[contentType] || "applied learning components";
  }


 
  buildUserPrompt(courseConfig, module, topic, contentType, customPrompt, existingContent) {
    const context = existingContent.length > 0 
      ? `\n\nCONTEXT FROM PREVIOUS TOPICS:\n${existingContent.slice(-2).map(c => `- ${c.title}`).join('\n')}` 
      : '';
  
    return `Create ${contentType} content for:
    
  **Course:** ${courseConfig.topic} 
  **Learning Goal:** ${courseConfig.context}
  **Depth:** Level ${courseConfig.depth}/5
  
  **Current Module:** ${module.summary}
  **Current Topic:** ${topic.summary}
  
  **Specific Request:** ${customPrompt}
  ${context}
  
  Focus on:
  1. Connecting to prerequisite knowledge
  2. Including ${this.getPracticalComponents(contentType)}
  3. Preparing for next topic: ${this.getNextTopicSummary(module, topic)}`;
  }
  
  getNextTopicSummary(module, topic) {
    const topics = module.topics;
    const index = topics.indexOf(topic);
    return index < topics.length - 1 
      ? topics[index + 1].summary 
      : "End of module";
  }
  truncateUserPrompt(userPrompt, maxLength) {
    if (userPrompt.length <= maxLength) {
      return userPrompt;
    }
    // Try to truncate at sentence boundaries
    const sentences = userPrompt.split(/[.!?]+/);
    let truncated = '';
    for (const sentence of sentences){
      if ((truncated + sentence).length > maxLength - 100) {
        break;
      }
      truncated += sentence + '. ';
    }
    return truncated + '\n\n[Note: Context truncated due to length limitations]';
  }
  async callOpenAI(systemPrompt, userPrompt) {
    console.log('Making Perplexity API request...');
    
    // Define JSON schema for content structure
    const contentSchema = {
      type: "object",
      properties: {
        title: {
          type: "string",
          minLength: 10,
          maxLength: 200,
          description: "Engaging and descriptive title"
        },
        content: {
          type: "string",
          minLength: 500,
          maxLength: 8000,
          description: "Comprehensive markdown content"
        },
        description: {
          type: "string",
          minLength: 20,
          maxLength: 500,
          description: "Brief overview of the content"
        },
        citations: {
          type: "array",
          minItems: 3,
          maxItems: 15,
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Unique citation ID"
              },
              type: {
                type: "string",
                enum: ["academic", "web", "book", "article", "documentation"],
                description: "Type of source"
              },
              title: {
                type: "string",
                description: "Source title"
              },
              authors: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Author names"
              },
              url: {
                type: "string",
                format: "uri",
                description: "Source URL"
              },
              publication_date: {
                type: "string",
                format: "date",
                description: "Publication date"
              },
              publisher: {
                type: "string",
                description: "Publisher name"
              },
              doi: {
                type: "string",
                description: "Digital Object Identifier"
              },
              access_date: {
                type: "string",
                format: "date",
                description: "Date accessed"
              },
              relevance: {
                type: "string",
                description: "Brief justification of source relevance"
              },
              excerpt: {
                type: "string",
                description: "Brief relevant excerpt from source"
              }
            },
            required: ["id", "type", "title", "relevance"]
          }
        }
      },
      required: ["title", "content", "citations"]
    };

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
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
        temperature: 0.7,
        max_tokens: 4000,
        response_format: {
          type: "json_schema",
          json_schema: { schema: contentSchema }
        }
      })
    });
    if (!response.ok) {
      const error = await response.json();
      console.error('Perplexity API error:', error);
      throw new Error(`Perplexity API error: ${error.error?.message || 'Unknown error'}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log('Perplexity response received, parsing...');
    try {
      const parsedContent = JSON.parse(content);
      // Ensure citations have access_date if missing
      if (parsedContent.citations) {
        parsedContent.citations = parsedContent.citations.map((citation)=>({
            ...citation,
            access_date: citation.access_date || new Date().toISOString().split('T')[0]
          }));
      }
      return parsedContent;
    } catch (parseError) {
      console.error('Failed to parse Perplexity response:', content);
      throw new Error('Invalid JSON response from Perplexity');
    }
  }
}
