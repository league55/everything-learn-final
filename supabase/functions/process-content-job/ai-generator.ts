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
    const depthDescriptions = {
      1: 'beginner-friendly with simple explanations and basic examples',
      2: 'introductory level with clear explanations and practical examples',
      3: 'intermediate level with detailed explanations and real-world applications',
      4: 'advanced level with comprehensive coverage and academic rigor',
      5: 'professional level with cutting-edge insights and industry applications'
    };
    return `You are an expert educational content creator with access to comprehensive academic and professional sources. Create high-quality learning content that is ${depthDescriptions[courseConfig.depth]}.

CRITICAL REQUIREMENTS:
1. You must respond with a valid JSON object matching this exact structure:
{
  "title": "Engaging and descriptive title (10-200 characters)",
  "content": "Comprehensive markdown content (500-8000 characters)",
  "description": "Brief overview of the content (20-500 characters, optional)",
  "citations": [
    {
      "id": "unique_citation_id",
      "type": "academic|web|book|article|documentation",
      "title": "Source title",
      "authors": ["Author Name"],
      "url": "https://example.com",
      "publication_date": "2024-01-01",
      "publisher": "Publisher Name",
      "doi": "10.1000/example",
      "access_date": "${new Date().toISOString().split('T')[0]}",
      "relevance_score": 0.95,
      "excerpt": "Brief relevant excerpt from source"
    }
  ]
}

CONTENT QUALITY STANDARDS:
- Content must be 500-8000 characters (manageable for context windows)
- Include 3-15 high-quality citations from authoritative sources
- Citations must be real, verifiable sources when possible
- Use proper markdown formatting with headers, lists, code blocks, etc.
- Include practical examples and applications
- Ensure content flows logically and builds understanding progressively

CITATION REQUIREMENTS:
- Prioritize recent sources (last 5 years when possible)
- Include a mix of source types: academic papers, official documentation, reputable websites
- Each citation must have a relevance score (0.0-1.0) indicating how directly it supports the content
- Include brief excerpts that show how the source supports your content
- For academic sources, include DOI when available
- For web sources, use reputable domains (.edu, .org, official company sites)

DEPTH LEVEL ${courseConfig.depth} GUIDELINES:
${this.getDepthGuidelines(courseConfig.depth)}

CONTENT TYPE: ${contentType.toUpperCase()}
${this.getContentTypeGuidelines(contentType)}`;
  }
  getDepthGuidelines(depth) {
    const guidelines = {
      1: `- Use simple, accessible language
- Focus on fundamental concepts and basic understanding
- Include plenty of analogies and everyday examples
- Avoid technical jargon unless clearly explained
- Provide step-by-step explanations`,
      2: `- Use clear, straightforward language with some technical terms
- Include practical examples and hands-on applications
- Explain concepts with real-world context
- Provide actionable insights and tips
- Balance theory with practice`,
      3: `- Use professional language with appropriate technical terminology
- Include detailed explanations and comprehensive coverage
- Provide case studies and real-world applications
- Reference industry standards and best practices
- Balance depth with accessibility`,
      4: `- Use advanced terminology and academic language
- Include comprehensive theoretical background
- Reference current research and academic literature
- Provide complex examples and edge cases
- Assume strong foundational knowledge`,
      5: `- Use expert-level language and cutting-edge terminology
- Include latest research and industry developments
- Reference peer-reviewed academic sources extensively
- Provide professional insights and advanced applications
- Assume expert-level background knowledge`
    };
    return guidelines[depth] || guidelines[3];
  }
  getContentTypeGuidelines(contentType) {
    const guidelines = {
      text: `Create comprehensive written content with:
- Clear structure using markdown headers
- Bullet points and numbered lists for key information
- Code examples in appropriate language blocks
- Emphasis on important concepts using **bold** and *italic*
- Include practical exercises or thought questions`,
      image: `Create detailed specifications for educational images:
- Describe visual elements that would enhance understanding
- Specify diagram types, charts, or infographic layouts
- Include alt text descriptions for accessibility
- Suggest interactive elements if applicable`,
      video: `Create comprehensive video content specifications:
- Detailed script with timing and visual cues
- Specify demonstrations, animations, or screen recordings
- Include interactive elements and pause points
- Provide transcript and accessibility considerations`,
      audio: `Create detailed audio content specifications:
- Full script with pacing and emphasis notes
- Specify background music or sound effects
- Include interactive elements and timestamps
- Provide transcript and accessibility features`,
      document: `Create structured document content:
- Professional formatting with clear sections
- Include templates, worksheets, or reference materials
- Specify downloadable resources and formats
- Ensure content is printer-friendly`,
      interactive: `Create interactive learning experience specifications:
- Detailed interaction design and user flow
- Specify quizzes, simulations, or hands-on exercises
- Include feedback mechanisms and progress tracking
- Ensure accessibility and mobile compatibility`
    };
    return guidelines[contentType] || guidelines.text;
  }
  buildUserPrompt(courseConfig, module, topic, contentType, customPrompt, existingContent) {
    const existingContentSummary = existingContent.length > 0 ? `\n\nEXISTING CONTENT FOR THIS TOPIC:\n${existingContent.map((content)=>`- ${content.title}: ${content.description || 'No description'}`).join('\n')}\n\nEnsure your content complements but doesn't duplicate existing content.` : '';
    return `Create ${contentType} content for this learning context:

COURSE: ${courseConfig.topic}
COURSE CONTEXT: ${courseConfig.context}
DEPTH LEVEL: ${courseConfig.depth}/5

MODULE: ${module.summary}
TOPIC: ${topic.summary}
TOPIC KEYWORDS: ${topic.keywords.join(', ')}

EXISTING TOPIC CONTENT: ${topic.content}

SPECIFIC REQUEST: ${customPrompt}${existingContentSummary}

Generate comprehensive ${contentType} content that:
1. Builds upon the existing topic foundation
2. Addresses the specific request
3. Maintains consistency with the course depth level
4. Includes authoritative citations and sources
5. Provides practical value to learners

Remember to include proper citations from authoritative sources and ensure all content meets the quality standards specified in the system prompt.`;
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
              relevance_score: {
                type: "number",
                minimum: 0,
                maximum: 1,
                description: "Relevance score (0.0-1.0)"
              },
              excerpt: {
                type: "string",
                description: "Brief relevant excerpt from source"
              }
            },
            required: ["id", "type", "title", "relevance_score"]
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
