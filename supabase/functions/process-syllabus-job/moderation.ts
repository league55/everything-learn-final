export class ModerationService {
  private openaiApiKey: string

  constructor() {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OpenAI API key not configured for moderation')
    }
    this.openaiApiKey = apiKey
  }

  async validateContent(inputText: string): Promise<{ safe: boolean; reason?: string }> {
    console.log('Validating content for moderation...')
    
    try {
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: inputText,
          model: 'omni-moderation-latest'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('OpenAI Moderation API error:', error)
        throw new Error(`Moderation API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      const result = data.results[0]
      
      console.log('Moderation result:', {
        flagged: result.flagged,
        categories: result.categories,
        category_scores: result.category_scores
      })

      if (result.flagged) {
        // Get the flagged categories for more specific feedback
        const flaggedCategories = Object.entries(result.categories)
          .filter(([_, flagged]) => flagged)
          .map(([category, _]) => category)

        return {
          safe: false,
          reason: this.getFriendlyErrorMessage(flaggedCategories)
        }
      }

      return { safe: true }
    } catch (error) {
      console.error('Error during content moderation:', error)
      
      // If moderation service fails, we should be conservative and allow the content
      // but log the error for monitoring
      console.warn('Moderation service unavailable, allowing content to proceed')
      return { safe: true }
    }
  }

  async validateCourseContent(topic: string, context: string): Promise<{ safe: boolean; reason?: string }> {
    // Combine topic and context for comprehensive moderation
    const combinedText = `Topic: ${topic}\n\nContext: ${context}`
    return await this.validateContent(combinedText)
  }

  private getFriendlyErrorMessage(flaggedCategories: string[]): string {
    // Map technical category names to user-friendly messages
    const categoryMessages: Record<string, string> = {
      'hate': 'content that promotes hate or discrimination',
      'hate/threatening': 'content that promotes hate or threatens violence',
      'harassment': 'content that harasses or bullies individuals',
      'harassment/threatening': 'content that harasses or threatens individuals',
      'self-harm': 'content related to self-harm',
      'self-harm/intent': 'content promoting self-harm',
      'self-harm/instructions': 'content with self-harm instructions',
      'sexual': 'sexual content',
      'sexual/minors': 'sexual content involving minors',
      'violence': 'violent content',
      'violence/graphic': 'graphic violent content',
      'illicit': 'content promoting illegal activities',
      'illicit/violent': 'content promoting illegal violence'
    }

    if (flaggedCategories.length === 0) {
      return 'This topic doesn\'t meet our content guidelines. Please try a different subject.'
    }

    // Get user-friendly descriptions for flagged categories
    const descriptions = flaggedCategories
      .map(cat => categoryMessages[cat] || 'inappropriate content')
      .filter((desc, index, arr) => arr.indexOf(desc) === index) // Remove duplicates

    if (descriptions.length === 1) {
      return `This topic contains ${descriptions[0]} and doesn't meet our content guidelines. Please try a different subject.`
    } else {
      return 'This topic doesn\'t meet our content guidelines. Please try a different subject.'
    }
  }
}