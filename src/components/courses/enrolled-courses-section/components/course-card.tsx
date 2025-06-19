import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Clock, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CourseWithDetails } from '@/lib/supabase/types'
import { getDepthLabel, getDepthColor, formatDate, calculateProgress } from '../utils/course-utils'
import { StatusBadge } from './status-badge'

interface CourseCardProps {
  course: CourseWithDetails
  variant: 'ready' | 'generating' | 'failed' | 'completed'
  onContinueLearning?: (courseId: string) => void
  onRetryGeneration?: (courseId: string) => void
}

export function CourseCard({ 
  course, 
  variant, 
  onContinueLearning, 
  onRetryGeneration 
}: CourseCardProps) {
  const progress = course.syllabus ? calculateProgress(course.user_enrollment, course.syllabus) : 0
  const completedDate = course.user_enrollment?.completed_at

  const getCardStyles = () => {
    switch (variant) {
      case 'generating':
        return 'border-blue-200 dark:border-blue-800'
      case 'failed':
        return 'border-red-200 dark:border-red-800'
      case 'completed':
        return 'border-green-200 dark:border-green-800'
      default:
        return ''
    }
  }

  const getStatusBadge = () => {
    switch (variant) {
      case 'generating':
        return (
          <StatusBadge 
            icon={Loader2} 
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
          >
            Generating
          </StatusBadge>
        )
      case 'failed':
        return (
          <StatusBadge 
            icon={RefreshCw} 
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          >
            Failed
          </StatusBadge>
        )
      case 'completed':
        return (
          <StatusBadge 
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          >
            Completed
          </StatusBadge>
        )
      default:
        return null
    }
  }

  const getActionButton = () => {
    switch (variant) {
      case 'ready':
        return (
          <Button 
            className="w-full"
            onClick={() => onContinueLearning?.(course.id)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Continue Learning
          </Button>
        )
      case 'generating':
        return (
          <Button 
            variant="outline"
            className="w-full"
            disabled
          >
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Course...
          </Button>
        )
      case 'failed':
        return (
          <Button 
            variant="outline"
            className="w-full border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
            onClick={() => onRetryGeneration?.(course.id)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Generation
          </Button>
        )
      case 'completed':
        return (
          <Button 
            variant="outline"
            className="w-full border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
            onClick={() => onContinueLearning?.(course.id)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Review Course
          </Button>
        )
    }
  }

  

  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", getCardStyles())}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2 flex-1">
            {course.topic}
          </CardTitle>
          {variant === 'completed' && (
            <div className="h-5 w-5 text-green-500 ml-2 flex-shrink-0">
              ✓
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge 
            variant="secondary" 
            className={cn("text-xs", getDepthColor(course.depth))}
          >
            {getDepthLabel(course.depth)}
          </StatusBadge>
          {getStatusBadge()}
          {course.syllabus && (
            <StatusBadge variant="outline">
              {course.syllabus.modules.length} modules
            </StatusBadge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.context}
        </p>
        
        {variant === 'ready' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {variant === 'generating' && course.generation_progress !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-blue-600 dark:text-blue-400">Generation Progress</span>
              <span className="text-blue-600 dark:text-blue-400">{course.generation_progress}%</span>
            </div>
            <Progress value={course.generation_progress} className="h-2" />
          </div>
        )}

        {variant === 'completed' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-green-600 dark:text-green-400 font-medium">100%</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
        )}

        {course.generation_error && variant === 'failed' && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-400">
              {course.generation_error}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {variant === 'completed' 
                ? `Completed ${completedDate ? formatDate(completedDate) : 'Recently'}`
                : `Enrolled ${formatDate(course.user_enrollment?.enrolled_at || '')}`
              }
            </span>
          </div>
        </div>

        {course.syllabus && variant === 'ready' && (
          <div className="text-sm text-muted-foreground">
            Module {(course.user_enrollment?.current_module_index || 0) + 1} of {course.syllabus.modules.length}
          </div>
        )}

        {getActionButton()}
      </CardContent>
    </Card>
  )
} 