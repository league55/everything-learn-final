// Mapping of course depth levels to Tavus replica IDs
// These would be actual replica IDs from your Tavus account
export const REPLICA_MAPPING = {
  // Depth 1-3: Practice Conversations (casual, friendly experts)
  practice: {
    technology: 'r6ae5b6efc9d',
    business: 'r6ae5b6efc9d',
    science: 'r6ae5b6efc9d',
    arts: 'r6ae5b6efc9d',
    language: 'r6ae5b6efc9d',
    default: 'r6ae5b6efc9d'
  },
  
  // Depth 4-5: Oral Examinations (formal, academic experts)
  exam: {
    technology: 'r6ae5b6efc9d',
    business: 'r6ae5b6efc9d',
    science: 'r6ae5b6efc9d',
    arts: 'r6ae5b6efc9d',
    language: 'r6ae5b6efc9d',
    default: 'r6ae5b6efc9d'
  }
}

export function getReplicaId(conversationType: 'practice' | 'exam', courseTopic: string): string {
  const topicLower = courseTopic.toLowerCase()
  
  // Determine category based on course topic keywords
  let category = 'default'
  
  if (topicLower.includes('programming') || topicLower.includes('coding') || 
      topicLower.includes('software') || topicLower.includes('tech') ||
      topicLower.includes('javascript') || topicLower.includes('python') ||
      topicLower.includes('react') || topicLower.includes('web development')) {
    category = 'technology'
  } else if (topicLower.includes('business') || topicLower.includes('marketing') ||
             topicLower.includes('management') || topicLower.includes('finance') ||
             topicLower.includes('entrepreneurship')) {
    category = 'business'
  } else if (topicLower.includes('science') || topicLower.includes('physics') ||
             topicLower.includes('chemistry') || topicLower.includes('biology') ||
             topicLower.includes('mathematics') || topicLower.includes('math')) {
    category = 'science'
  } else if (topicLower.includes('art') || topicLower.includes('design') ||
             topicLower.includes('creative') || topicLower.includes('music') ||
             topicLower.includes('writing')) {
    category = 'arts'
  } else if (topicLower.includes('language') || topicLower.includes('english') ||
             topicLower.includes('spanish') || topicLower.includes('french') ||
             topicLower.includes('communication')) {
    category = 'language'
  }
  
  return REPLICA_MAPPING[conversationType][category as keyof typeof REPLICA_MAPPING[typeof conversationType]]
}

export function generatePersonalizedScript(
  userName: string,
  courseTopic: string,
  moduleSummary: string,
  conversationType: 'practice' | 'exam'
): string {
  if (conversationType === 'practice') {
    return `Hello ${userName}! Congratulations on completing your course on ${courseTopic}. I'm here to have a friendly conversation with you about what you've learned. Let's discuss the practical applications of ${moduleSummary}. What aspect of this topic interests you most, and how do you think you might apply this knowledge in real life?`
  } else {
    return `Good day ${userName}. I'm here to conduct your oral examination for the course on ${courseTopic}. We'll be discussing ${moduleSummary} and related concepts. This is a formal assessment to evaluate your understanding and mastery of the material. Are you ready to begin? Let's start with a fundamental question about the core principles you've studied.`
  }
}