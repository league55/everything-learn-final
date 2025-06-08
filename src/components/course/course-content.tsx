import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { CourseConfiguration, SyllabusModule, SyllabusTopic, UserEnrollment } from '@/lib/supabase'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  BookOpen,
  Clock,
  Target,
  User,
  Loader2,
  Sparkles,
  FileText,
  Info,
  ExternalLink,
  Quote
} from 'lucide-react'
import { cn } from '@/lib/utils'
import 'highlight.js/styles/github-dark.css'

interface CourseContentProps {
  course: CourseConfiguration
  module: SyllabusModule
  topic: SyllabusTopic
  moduleIndex: number
  topicIndex: number
  totalModules: number
  enrollment: UserEnrollment
  fullContent?: string | null
  onGenerateFullContent: () => void
  isGeneratingFullContent: boolean
  onMarkComplete: () => void
  onNavigate: (moduleIndex: number, topicIndex: number) => void
}

export function CourseContent({
  course,
  module,
  topic,
  moduleIndex,
  topicIndex,
  totalModules,
  enrollment,
  fullContent,
  onGenerateFullContent,
  isGeneratingFullContent,
  onMarkComplete,
  onNavigate
}: CourseContentProps) {
  const canGoBack = moduleIndex > 0 || topicIndex > 0
  const canGoForward = moduleIndex < totalModules - 1 || topicIndex < module.topics.length - 1
  const isLastTopic = moduleIndex === totalModules - 1 && topicIndex === module.topics.length - 1

  const handlePrevious = () => {
    if (topicIndex > 0) {
      onNavigate(moduleIndex, topicIndex - 1)
    } else if (moduleIndex > 0) {
      // Go to last topic of previous module
      const prevModule = moduleIndex - 1
      onNavigate(prevModule, module.topics.length - 1)
    }
  }

  const handleNext = () => {
    if (topicIndex < module.topics.length - 1) {
      onNavigate(moduleIndex, topicIndex + 1)
    } else if (moduleIndex < totalModules - 1) {
      // Go to first topic of next module
      onNavigate(moduleIndex + 1, 0)
    }
  }

  const getDepthLabel = (depth: number) => {
    const labels = {
      1: 'Beginner',
      2: 'Casual', 
      3: 'Hobby',
      4: 'Academic',
      5: 'Professional'
    }
    return labels[depth as keyof typeof labels] || 'Unknown'
  }

  const courseProgress = Math.round((enrollment.current_module_index / totalModules) * 100)

  // Parse full content if it's a JSON string
  const parseFullContent = (content: string | null): { 
    content: string, 
    metadata?: any, 
    citations?: any[] 
  } | null => {
    if (!content) return null
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content)
      if (parsed.content) {
        return {
          content: parsed.content,
          metadata: parsed.metadata,
          citations: parsed.citations
        }
      }
      // If it's JSON but doesn't have content field, return as is
      return { content: content }
    } catch {
      // If it's not JSON, treat as plain markdown
      return { content: content }
    }
  }

  const parsedFullContent = parseFullContent(fullContent)

  return (
    <div className="flex flex-col h-full">
      {/* Content Header - Fixed */}
      <div className="flex-shrink-0 border-b border-border p-6 bg-card">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>{course.topic}</span>
          <span>→</span>
          <span>Module {moduleIndex + 1}</span>
          <span>→</span>
          <span className="text-foreground font-medium">{topic.summary}</span>
        </div>

        {/* Topic Header */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-xs">
                Module {moduleIndex + 1} • Topic {topicIndex + 1}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {getDepthLabel(course.depth)}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{topic.summary}</h1>
            <p className="text-lg text-muted-foreground line-clamp-2">
              {module.summary}
            </p>
          </div>

          {/* Keywords */}
          {topic.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {topic.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}

          {/* Progress Info */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{totalModules} modules</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>Progress: {courseProgress}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto p-6 pb-24">
            {/* Topic Overview */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Topic Overview</h2>
              </div>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold mb-3 mt-6 first:mt-0">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-base leading-7 mb-4">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className
                      return isInline ? (
                        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                          {children}
                        </code>
                      ) : (
                        <code className={className}>{children}</code>
                      )
                    },
                    pre: ({ children }) => (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {topic.content}
                </ReactMarkdown>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Full Content Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Comprehensive Content</h2>
                </div>
                
                {!parsedFullContent && !isGeneratingFullContent && (
                  <Button 
                    onClick={onGenerateFullContent}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Topic Content
                  </Button>
                )}
              </div>

              {/* Content Display */}
              {isGeneratingFullContent ? (
                <div className="flex flex-col items-center justify-center py-12 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/25">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Generating Content...</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Our AI is creating comprehensive learning content for this topic. 
                    This may take a few moments.
                  </p>
                </div>
              ) : parsedFullContent ? (
                <div className="space-y-6">
                  {/* Main Content */}
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-3xl font-bold mb-6 mt-8 first:mt-0">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-2xl font-semibold mb-4 mt-8 first:mt-0">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xl font-semibold mb-3 mt-6 first:mt-0">{children}</h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-base leading-7 mb-4">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children, className }) => {
                          const isInline = !className
                          return isInline ? (
                            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                              {children}
                            </code>
                          ) : (
                            <code className={className}>{children}</code>
                          )
                        },
                        pre: ({ children }) => (
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                            {children}
                          </pre>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full border border-border">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border border-border px-4 py-2 bg-muted text-left font-semibold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-border px-4 py-2">{children}</td>
                        ),
                      }}
                    >
                      {parsedFullContent.content}
                    </ReactMarkdown>
                  </div>

                  {/* Citations Section */}
                  {parsedFullContent.citations && parsedFullContent.citations.length > 0 && (
                    <div className="mt-8 p-6 bg-muted/30 rounded-lg border">
                      <div className="flex items-center gap-2 mb-4">
                        <Quote className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Sources & References</h3>
                      </div>
                      <div className="space-y-3">
                        {parsedFullContent.citations.map((citation: any, index: number) => (
                          <div key={citation.id || index} className="text-sm">
                            <div className="font-medium">{citation.title}</div>
                            {citation.authors && citation.authors.length > 0 && (
                              <div className="text-muted-foreground">
                                By: {citation.authors.join(', ')}
                              </div>
                            )}
                            {citation.publisher && (
                              <div className="text-muted-foreground">
                                {citation.publisher}
                                {citation.publication_date && ` (${citation.publication_date})`}
                              </div>
                            )}
                           
                            {citation.excerpt && (
                              <div className="text-xs text-muted-foreground mt-1 italic">
                                "{citation.excerpt}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata Section */}
                  {parsedFullContent.metadata && (
                    <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {parsedFullContent.metadata.word_count && (
                          <div>
                            <div className="font-medium text-muted-foreground">Word Count</div>
                            <div>{parsedFullContent.metadata.word_count}</div>
                          </div>
                        )}
                        {parsedFullContent.metadata.estimated_reading_time && (
                          <div>
                            <div className="font-medium text-muted-foreground">Reading Time</div>
                            <div>{parsedFullContent.metadata.estimated_reading_time} min</div>
                          </div>
                        )}
                        {parsedFullContent.metadata.difficulty_level && (
                          <div>
                            <div className="font-medium text-muted-foreground">Difficulty</div>
                            <div className="capitalize">{parsedFullContent.metadata.difficulty_level}</div>
                          </div>
                        )}
                        {parsedFullContent.metadata.key_concepts && (
                          <div>
                            <div className="font-medium text-muted-foreground">Key Concepts</div>
                            <div>{parsedFullContent.metadata.key_concepts.length}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/25">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Comprehensive Content Yet</h3>
                </div>
              )}
            </div>

            {/* Learning Objectives Section */}
            <div className="mt-12 p-6 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Objectives
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Understand the key concepts covered in this topic</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Apply the knowledge in practical scenarios</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Connect this topic to the broader course context</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Navigation Footer - Fixed */}
      <div className="flex-shrink-0 border-t border-border p-4 bg-card">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Topic {topicIndex + 1} of {module.topics.length} • Module {moduleIndex + 1} of {totalModules}
            </div>
            
            {isLastTopic ? (
              <Button onClick={onMarkComplete} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Complete Course
              </Button>
            ) : (
              <Button onClick={onMarkComplete} variant="outline">
                Mark Complete & Continue
              </Button>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={!canGoForward}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}