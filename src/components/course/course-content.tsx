import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { SyllabusTopic } from '@/lib/supabase'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { 
  CheckCircle, 
  Circle, 
  BookOpen, 
  Tag,
  Clock,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CourseContentProps {
  topic: SyllabusTopic | null
  moduleIndex: number
  topicIndex: number
  onTopicComplete: (moduleIndex: number, topicIndex: number) => void
  isCompleted: boolean
}

export function CourseContent({
  topic,
  moduleIndex,
  topicIndex,
  onTopicComplete,
  isCompleted
}: CourseContentProps) {
  const [readingTime, setReadingTime] = useState<number>(0)

  useEffect(() => {
    if (topic) {
      // Calculate estimated reading time (average 200 words per minute)
      const wordCount = topic.content.split(/\s+/).length
      const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 200))
      setReadingTime(estimatedMinutes)
    }
  }, [topic])

  const handleMarkAsComplete = () => {
    onTopicComplete(moduleIndex, topicIndex)
  }

  if (!topic) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Select a Topic</h3>
          <p className="text-sm">Choose a topic from the navigation to start learning</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{topic.summary}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>Module {moduleIndex + 1}, Topic {topicIndex + 1}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleMarkAsComplete}
              variant={isCompleted ? "outline" : "default"}
              size="sm"
              className="ml-4"
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Completed
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </>
              )}
            </Button>
          </div>

          {/* Keywords */}
          {topic.keywords && topic.keywords.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {topic.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="mb-6" />
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-8">
            <MarkdownRenderer content={topic.content} />
          </CardContent>
        </Card>

        {/* Navigation Hint */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground text-center">
            💡 Use the sidebar navigation to move between topics or search for specific content
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}