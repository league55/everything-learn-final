import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Settings,
  RotateCcw,
  AlertTriangle
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

  const getStatusInfo = () => {
    const syllabusStatus = course.syllabus?.status
    const jobStatus = course.generation_job?.status

    if (syllabusStatus === 'generating' || jobStatus === 'processing') {
      return {
        status: 'generating',
        label: 'Generating...',
        description: 'Course is being generated',
        variant: 'secondary' as const,
        icon: Settings
      }
    }

    if (syllabusStatus === 'failed' || jobStatus === 'failed') {
      return {
        status: 'failed',
        label: 'Generation Failed',
        description: course.generation_job?.error_message || 'Course generation failed',
        variant: 'destructive' as const,
        icon: AlertTriangle
      }
    }

    if (syllabusStatus === 'completed') {
      return {
        status: 'completed',
        label: 'Available',
        description: 'Course is ready to learn',
        variant: 'default' as const,
        icon: BookOpen
      }
    }

    return {
      status: 'pending',
      label: 'Pending',
      description: 'Course generation queued',
      variant: 'outline' as const,
      icon: TrendingUp
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

  const handleRetry = async () => {
    if (!user || course.user_id !== user.id) {
      toast({
        title: "Not Authorized",
        description: "You can only retry your own courses.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setRetrying(true)
    try {
      await dbOperations.retrySyllabusGeneration(course.id)
      
      toast({
        title: "Retry Initiated",
        description: "Course generation has been restarted.",
        duration: 3000,
      })

      onEnrollmentChange()
    } catch (err) {
      console.error('Failed to retry:', err)
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

    // Store authentication data for cross-domain access
    await authStorage.storeAuthForLibrary(user)
    
    // Redirect to external library
    const libraryUrl = `https://library.everythinglearn.online/courses/${course.id}/learn`
    window.open(libraryUrl, '_blank')
  }

  const statusInfo = getStatusInfo()
  const isEnrolled = course.user_enrollment !== undefined
  const isOwner = user && course.user_id === user.id
  const canRetry = statusInfo.status === 'failed' && isOwner

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
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
          
          <Badge variant={statusInfo.variant} className="text-xs">
            <statusInfo.icon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
          
          {course.syllabus && statusInfo.status === 'completed' && (
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
          
          {/* Status-specific content */}
          {statusInfo.status === 'generating' && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="animate-spin">
                <Settings className="h-4 w-4" />
              </div>
              <span>Generating course content...</span>
            </div>
          )}

          {statusInfo.status === 'failed' && (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {statusInfo.description}
              </AlertDescription>
            </Alert>
          )}
          
          {course.syllabus?.keywords && course.syllabus.keywords.length > 0 && statusInfo.status === 'completed' && (
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
              <span>{isOwner ? 'By you' : 'By community'}</span>
            </div>
          </div>

          {/* Action buttons */}
          {canRetry && (
            <Button 
              variant="outline" 
              className="w-full border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
              onClick={handleRetry}
              disabled={retrying}
            >
              {retrying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry Generation
                </>
              )}
            </Button>
          )}

          {statusInfo.status === 'completed' && (
            <>
              {isEnrolled ? (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleContinueLearning}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Continue Learning
                </Button>
              ) : (
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
              )}
            </>
          )}

          {statusInfo.status === 'generating' && (
            <Button 
              variant="outline" 
              className="w-full"
              disabled
            >
              <Settings className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </Button>
          )}

          {statusInfo.status === 'pending' && (
            <Button 
              variant="outline" 
              className="w-full"
              disabled
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Queued for Generation
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}