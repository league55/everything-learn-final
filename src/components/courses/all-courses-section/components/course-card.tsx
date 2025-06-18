import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  User, 
  BookOpen, 
  Loader2,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CourseWithDetails } from '@/lib/supabase'
import { getDepthLabel, getDepthColor, formatDate, calculateProgress } from '../../enrolled-courses-section/utils/course-utils'
import { StatusBadge } from '../../enrolled-courses-section/components/status-badge'
import { useAuth } from '@/providers/auth-provider'
import { dbOperations } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { authStorage } from '@/lib/auth-storage'
import { useState } from 'react'

interface CourseCardProps {
  course: CourseWithDetails
  onEnrollmentChange: () => void
}

export function CourseCard({ course, onEnrollmentChange }: CourseCardProps) {
  const [enrolling, setEnrolling] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const getCardStyles = () => {
    switch (course.generation_status) {
      case 'generating':
        return 'border-blue-200 dark:border-blue-800'
      case 'failed':
        return 'border-red-200 dark:border-red-800'
      default:
        return ''
    }
  }

  const getStatusBadge = () => {
    switch (course.generation_status) {
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
      default:
        return null
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    setEnrolling(true)
    try {
      await dbOperations.enrollInCourse(course.id)
      
      toast({
        title: "Successfully Enrolled!",
        description: "You can now start learning this course.",
        duration: 3000,
      })

      onEnrollmentChange()
    } catch (err) {
      console.error('Failed to enroll:', err)
      toast({
        title: "Enrollment Failed",
        description: err instanceof Error ? err.message : "Please try again later.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setEnrolling(false)
    }
  }

  const handleContinueLearning = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    // Store authentication data for cross-domain access
    await authStorage.storeAuthForLibrary(user)
    
    // Redirect to external library
    const libraryUrl = `https://library.everythinglearn.online/courses/${course.id}/learn`
    window.open(libraryUrl, '_blank')
  }

  const isEnrolled = course.user_enrollment !== undefined
  const canEnroll = course.generation_status === 'completed' && !isEnrolled
  const canContinue = course.generation_status === 'completed' && isEnrolled

  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col", getCardStyles())}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem]">
          {course.topic}
        </CardTitle>
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
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.context}
        </p>
        
        {course.generation_status === 'generating' && course.generation_progress !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-blue-600 dark:text-blue-400">Generation Progress</span>
              <span className="text-blue-600 dark:text-blue-400">{course.generation_progress}%</span>
            </div>
            <Progress value={course.generation_progress} className="h-2" />
          </div>
        )}

        {course.generation_error && course.generation_status === 'failed' && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-400">
              {course.generation_error}
            </p>
          </div>
        )}

        <div className="space-y-4 mt-auto">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.enrollment_count || 0} enrolled</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>By community</span>
            </div>
          </div>

          {canContinue ? (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleContinueLearning}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
          ) : canEnroll ? (
            <Button 
              className="w-full"
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  {user ? 'Enroll Now' : 'Sign In to Enroll'}
                </>
              )}
            </Button>
          ) : (
            <Button 
              variant="outline"
              className="w-full"
              disabled
            >
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {course.generation_status === 'generating' ? 'Generating...' : 'Generation Failed'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 