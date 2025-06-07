import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { SyllabusModule } from '@/lib/supabase'
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  Circle,
  BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CourseNavigationProps {
  modules: SyllabusModule[]
  selectedModule: number
  selectedTopic: number
  onTopicSelect: (moduleIndex: number, topicIndex: number) => void
  completedTopics: Set<string>
  searchQuery: string
}

export function CourseNavigation({
  modules,
  selectedModule,
  selectedTopic,
  onTopicSelect,
  completedTopics,
  searchQuery
}: CourseNavigationProps) {
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set([selectedModule])
  )

  const toggleModule = (moduleIndex: number) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleIndex)) {
      newExpanded.delete(moduleIndex)
    } else {
      newExpanded.add(moduleIndex)
    }
    setExpandedModules(newExpanded)
  }

  const getModuleProgress = (moduleIndex: number): number => {
    const module = modules[moduleIndex]
    if (!module?.topics) return 0
    
    const totalTopics = module.topics.length
    const completedCount = module.topics.filter((_, topicIndex) =>
      completedTopics.has(`${moduleIndex}-${topicIndex}`)
    ).length
    
    return totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0
  }

  const filterTopics = (module: SyllabusModule) => {
    if (!searchQuery.trim()) return module.topics || []
    
    return (module.topics || []).filter(topic =>
      topic.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.keywords.some(keyword =>
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  }

  const filteredModules = modules.filter(module => {
    if (!searchQuery.trim()) return true
    
    // Include module if its summary matches or it has matching topics
    return (
      module.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      filterTopics(module).length > 0
    )
  })

  return (
    <div className="p-4 space-y-2">
      {filteredModules.map((module, moduleIndex) => {
        const originalModuleIndex = modules.indexOf(module)
        const isExpanded = expandedModules.has(originalModuleIndex)
        const progress = getModuleProgress(originalModuleIndex)
        const filteredTopics = filterTopics(module)

        return (
          <Collapsible
            key={originalModuleIndex}
            open={isExpanded}
            onOpenChange={() => toggleModule(originalModuleIndex)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start p-3 h-auto",
                  originalModuleIndex === selectedModule && "bg-accent"
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                  <BookOpen className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-medium truncate">
                      Module {originalModuleIndex + 1}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {module.summary}
                    </div>
                  </div>
                  {progress > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {progress}%
                    </Badge>
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-1">
              <div className="ml-6 pl-4 border-l border-border space-y-1">
                {filteredTopics.map((topic, topicIndex) => {
                  const originalTopicIndex = (module.topics || []).indexOf(topic)
                  const isSelected = 
                    originalModuleIndex === selectedModule && 
                    originalTopicIndex === selectedTopic
                  const isCompleted = completedTopics.has(
                    `${originalModuleIndex}-${originalTopicIndex}`
                  )

                  return (
                    <Button
                      key={originalTopicIndex}
                      variant="ghost"
                      size="sm"
                      onClick={() => onTopicSelect(originalModuleIndex, originalTopicIndex)}
                      className={cn(
                        "w-full justify-start p-2 h-auto text-left",
                        isSelected && "bg-primary/10 border border-primary/20"
                      )}
                    >
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {topic.summary}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {topic.keywords.slice(0, 2).map((keyword, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs px-1 py-0"
                              >
                                {keyword}
                              </Badge>
                            ))}
                            {topic.keywords.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs px-1 py-0"
                              >
                                +{topic.keywords.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Button>
                  )
                })}
                
                {filteredTopics.length === 0 && searchQuery && (
                  <div className="text-sm text-muted-foreground p-2">
                    No matching topics in this module
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
      
      {filteredModules.length === 0 && searchQuery && (
        <div className="text-center text-muted-foreground p-4">
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm">No topics found for "{searchQuery}"</div>
        </div>
      )}
    </div>
  )
}