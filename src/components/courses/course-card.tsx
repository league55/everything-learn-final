import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/providers/auth-provider'
import { dbOperations } from '@/lib/supabase'
import type { CourseWithDetails } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { authStorage } from '@/lib/auth-storage'
import { 
  Users, 
  User, 
  BookOpen, 
  TrendingUp,
  Loader2,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CourseCardProps {
  course: CourseWithDetails
  onEnrollmentChange: () => void
}

export function CourseCard({ course, onEnrollmentChange }: CourseCardProps) {
  const [enrolling, setEnrolling] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

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

  const getDepthColor = (depth: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      4: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      5: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
    return colors[depth as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  const getGenerationStatusBadge = () => {
    switch (course.generation_status) {
      case 'generating':
        return (
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Generating...
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Generation Failed
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
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

    if (course.generation_status !== 'completed') {
      toast({
        title: "Course Not Ready",
        description: "This course is still being generated. Please wait for it to complete.",
        variant: "destructive",
        duration: 3000,
      })
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

  const handleRetryGeneration = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    setRetrying(true)
    try {
      await dbOperations.retryCourseGeneration(course.id)
      
      toast({
        title: "Generation Retried",
        description: "Course generation has been restarted. Please check back in a few minutes.",
        duration: 5000,
      })

      onEnrollmentChange()
    } catch (err) {
      console.error('Failed to retry generation:', err)
      toast({
        title: "Retry Failed",
        description: err instanceof Error ? err.message : "Please try again later.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setRetrying(false)
    }
  }

  const handleContinueLearning = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    if (course.generation_status !== 'completed') {
      toast({
        title: "Course Not Ready",
        description: "This course is still being generated. Please wait for it to complete.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // Store authentication data for cross-domain access
    await authStorage.storeAuthForLibrary(user)
    
    // Redirect to external library
    const libraryUrl = `https://library.everythinglearn.online/courses/${course.id}/learn`
    window.open(libraryUrl, '_blank')
  }

  const isEnrolled = course.user_enrollment !== undefined
  const isGenerating = course.generation_status === 'generating'
  const isFailed = course.generation_status === 'failed'
  const isCompleted = course.generation_status === 'completed'

  // Add this debug logging
  console.log('Course:', course.topic)
  console.log('Syllabus:', course.syllabus)
  console.log('Generation Job:', course.generation_job)
  console.log('Syllabus status:', course.syllabus?.status)
  console.log('Job status:', course.generation_job?.status)

  return (
    <Card className={cn(
      "overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col",
      isFailed && "border-red-200 dark:border-red-800",
      isGenerating && "border-blue-200 dark:border-blue-800"
    )}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem]">
          {course.topic}
        </CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="secondary" 
            className={cn("text-xs", getDepthColor(course.depth))}
          >
            {getDepthLabel(course.depth)}
          </Badge>
          {getGenerationStatusBadge()}
          {course.syllabus && (
            <Badge variant="outline" className="text-xs">
              {course.syllabus.modules.length} modules
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        {/* Main content area */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3 min-h-[4.5rem]">
            {course.context}
          </p>
          
          {/* Generation Progress */}
          {isGenerating && course.generation_progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Generating Course
                </span>
                <span className="text-blue-600 dark:text-blue-400">{course.generation_progress}%</span>
              </div>
              <Progress value={course.generation_progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                This usually takes 2-3 minutes. You'll be able to enroll once it's complete.
              </p>
            </div>
          )}

          {/* Error Message */}
          {isFailed && course.generation_error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                {course.generation_error}
              </p>
            </div>
          )}
          
          {course.syllabus?.keywords && course.syllabus.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {course.syllabus.keywords.slice(0, 3).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {course.syllabus.keywords.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{course.syllabus.keywords.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Footer area - always at bottom */}
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

          {/* Action Buttons */}
          {isFailed ? (
            <Button 
              variant="outline" 
              className="w-full border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
              onClick={handleRetryGeneration}
              disabled={retrying}
            >
              {retrying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Generation
                </>
              )}
            </Button>
          ) : isGenerating ? (
            <Button 
              variant="outline" 
              className="w-full"
              disabled
            >
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Course...
            </Button>
          ) : isEnrolled ? (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleContinueLearning}
              disabled={!isCompleted}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
          ) : (
            <Button 
              className="w-full"
              onClick={handleEnroll}
              disabled={enrolling || !isCompleted}
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
          )}
        </div>
      </CardContent>
    </Card>
  )
}