import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/providers/auth-provider'
import { dbOperations } from '@/lib/supabase'
import type { CourseWithDetails } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { authStorage } from '@/lib/auth-storage'
import { 
  GraduationCap,
  Loader2,
  Clock,
  Target,
  Play,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function EnrolledCoursesSection() {
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const loadEnrolledCourses = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const userCourses = await dbOperations.getUserEnrolledCourses()
        setEnrolledCourses(userCourses)
      } catch (err) {
        console.error('Failed to load enrolled courses:', err)
        setError('Failed to load enrolled courses. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadEnrolledCourses()
  }, [user])

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

  // Don't show this section if user is not authenticated
  if (!user) {
    return null
  }

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">My Learning Progress</h2>
            <p className="text-muted-foreground">Continue your learning journey</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading your enrolled courses...</span>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">My Learning Progress</h2>
            <p className="text-muted-foreground">Continue your learning journey</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">My Learning Progress</h2>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>
      </div>

      {enrolledCourses.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
          <CardHeader className="text-center py-8">
            <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl text-muted-foreground">
              No enrolled courses yet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <p className="text-muted-foreground mb-4">
              Start learning by enrolling in a course below or create your own.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      <Target className="h-4 w-4" />
                      <span>{getDepthLabel(course.depth)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Enrolled {formatDate(course.user_enrollment?.enrolled_at || '')}</span>
                    </div>
                  </div>

                  {course.syllabus && (
                    <div className="text-sm text-muted-foreground">
                      Module {course.user_enrollment?.current_module_index || 0 + 1} of {course.syllabus.modules.length}
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    variant={isCompleted ? "outline" : "default"}
                    onClick={() => handleContinueLearning(course.id)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {isCompleted ? 'Review Course' : 'Continue Learning'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}