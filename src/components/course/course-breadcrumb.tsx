import { ChevronRight, Home } from 'lucide-react'
import type { SyllabusModule } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface CourseBreadcrumbProps {
  courseTopic: string
  modules: SyllabusModule[]
  selectedModule: number
  selectedTopic: number
}

export function CourseBreadcrumb({
  courseTopic,
  modules,
  selectedModule,
  selectedTopic
}: CourseBreadcrumbProps) {
  const currentModule = modules[selectedModule]
  const currentTopic = currentModule?.topics?.[selectedTopic]

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Home className="h-4 w-4" />
        <span className="font-medium text-foreground truncate max-w-[200px]">
          {courseTopic}
        </span>
      </div>
      
      {currentModule && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="truncate max-w-[150px]">
            Module {selectedModule + 1}
          </span>
        </>
      )}
      
      {currentTopic && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="truncate max-w-[200px]">
            {currentTopic.summary}
          </span>
        </>
      )}
    </nav>
  )
}