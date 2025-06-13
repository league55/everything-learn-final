import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Target, Clock, Play, CheckCircle, TrendingUp, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { dbOperations } from '@/lib/supabase'
import type { CourseWithDetails } from '@/lib/supabase'
import { useAuth } from '@/providers/auth-provider'
import { authStorage } from '@/lib/auth-storage'

interface CourseListProps {
  // Remove the old props since we'll fetch enrolled courses directly
}

export function CourseList({}: CourseListProps) {
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const loadEnrolledCourses = async () => {
      try {
        setLoading(true)
        const userCourses = await dbOperations.getUserEnrolledCourses()
        setEnrolledCourses(userCourses)
      } catch (err) {
        console.error('Failed to load enrolled courses:', err)
        setError('Failed to load your enrolled courses.')
      } finally {
        setLoading(false)
      }
    }

    loadEnrolledCourses()
  }, [])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateProgress = (enrollment: any, syllabus: any) => {
    if (!syllabus?.modules || syllabus.modules.length === 0) return 0
    return Math.round((enrollment.current_module_index / syllabus.modules.length) * 100)
  }

  const handleContinueLearning = async (courseId: string) => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    // Store authentication data for cross-domain access
    await authStorage.storeAuthForLibrary(user)
    
    // Redirect to external library
    const libraryUrl = `https://www.library.everythinglearn.online/courses/${courseId}/learn`
    window.open(libraryUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your enrolled courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive text-center">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (enrolledCourses.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
        <CardHeader className="text-center py-12">
          <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl text-muted-foreground">
            No enrolled courses yet
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-12">
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            You haven't enrolled in any courses yet. Browse available courses to start learning.
          </p>
          <Button asChild>
            <a href="/courses">Browse Courses</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {enrolledCourses.map((course) => {
        const progress = course.syllabus ? calculateProgress(course.user_enrollment, course.syllabus) : 0
        const isCompleted = course.user_enrollment?.status === 'completed'
        
        return (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2 flex-1">
                  {course.topic}
                </CardTitle>
                {isCompleted && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />
                )}
              </div>
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
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.context}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Enrolled {formatDate(course.user_enrollment?.enrolled_at || '')}</span>
                </div>
              </div>

              {course.syllabus && (
                <div className="text-sm text-muted-foreground">
                  Module {(course.user_enrollment?.current_module_index || 0) + 1} of {course.syllabus.modules.length}
                </div>
              )}

              <Button 
                className="w-full" 
                variant={isCompleted ? "outline" : "default"}
                onClick={() => handleContinueLearning(course.id)}
              >
                {isCompleted ? (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Review Course
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Continue Learning
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}