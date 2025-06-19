import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/providers/auth-provider'
import { enrollmentDb } from '@/lib/supabase/db'
import type { CourseWithDetails } from '@/lib/supabase/types'
import { useToast } from '@/hooks/use-toast'
import { authStorage } from '@/lib/auth-storage'
import { 
  GraduationCap,
  Loader2,
  BookOpen,
  Clock,
  Award,
  AlertCircle
} from 'lucide-react'
import { filterCoursesByStatus } from './utils/course-utils'
import { ReadyCoursesTab } from './tabs/ready-courses-tab'
import { GeneratingCoursesTab } from './tabs/generating-courses-tab'
import { FailedCoursesTab } from './tabs/failed-courses-tab'
import { CompletedCoursesTab } from './tabs/completed-courses-tab'

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
        const userCourses = await enrollmentDb.getUserEnrolledCourses()
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

  const handleContinueLearning = async (courseId: string) => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    // Store authentication data for cross-domain access
    await authStorage.storeAuthForLibrary(user)
    
    // Redirect to external library
    const libraryUrl = `https://library.everythinglearn.online/courses/${courseId}/learn`
    window.open(libraryUrl, '_blank')
  }

  const handleRetryGeneration = async (courseId: string) => {
    try {
      await enrollmentDb.retryCourseGeneration(courseId)
      
      toast({
        title: "Generation Retried",
        description: "Course generation has been restarted. Please check back in a few minutes.",
        duration: 5000,
      })

      // Reload courses
      const userCourses = await enrollmentDb.getUserEnrolledCourses()
      setEnrolledCourses(userCourses)
    } catch (err) {
      console.error('Failed to retry generation:', err)
      toast({
        title: "Retry Failed",
        description: err instanceof Error ? err.message : "Please try again later.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const { readyCourses, generatingCourses, failedCourses, completedCourses } = 
    filterCoursesByStatus(enrolledCourses)

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
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Ready ({readyCourses.length})
            </TabsTrigger>
            <TabsTrigger value="generating" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Generating ({generatingCourses.length})
            </TabsTrigger>
            <TabsTrigger value="failed" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Failed ({failedCourses.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Completed ({completedCourses.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-6">
            <ReadyCoursesTab 
              courses={readyCourses}
              onContinueLearning={handleContinueLearning}
            />
          </TabsContent>

          <TabsContent value="generating" className="mt-6">
            <GeneratingCoursesTab courses={generatingCourses} />
          </TabsContent>

          <TabsContent value="failed" className="mt-6">
            <FailedCoursesTab 
              courses={failedCourses}
              onRetryGeneration={handleRetryGeneration}
            />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <CompletedCoursesTab 
              courses={completedCourses}
              onContinueLearning={handleContinueLearning}
            />
          </TabsContent>
        </Tabs>
      )}
    </section>
  )
} 