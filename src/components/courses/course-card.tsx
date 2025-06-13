import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CourseCardProps {
  course: CourseWithDetails
  onEnrollmentChange: () => void
}

export function CourseCard({ course, onEnrollmentChange }: CourseCardProps) {
  const [enrolling, setEnrolling] = useState(false)
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
    const libraryUrl = `https://www.library.everythinglearn.online/courses/${course.id}/learn`
    window.open(libraryUrl, '_blank')
  }

  const isEnrolled = course.user_enrollment !== undefined

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">
          {course.topic}
        </CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="secondary" 
            className={cn("text-xs", getDepthColor(course.depth))}
          >
            {getDepthLabel(course.depth)}
          </Badge>
          {course.syllabus && (
            <Badge variant="outline" className="text-xs">
              {course.syllabus.modules.length} modules
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {course.context}
        </p>
        
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
      </CardContent>
    </Card>
  )
}