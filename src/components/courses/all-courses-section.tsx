import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/providers/auth-provider'
import { dbOperations } from '@/lib/supabase'
import type { CourseWithDetails } from '@/lib/supabase'
import { CourseCard } from './course-card'
import { 
  BookOpen,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

export function AllCoursesSection() {
  const [allCourses, setAllCourses] = useState<CourseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  
  const { user, loading: authLoading } = useAuth()

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load all courses (including generating ones)
      const courses = await dbOperations.getAllCourses()
      setAllCourses(courses)

    } catch (err) {
      console.error('Failed to load courses:', err)
      setError('Failed to load courses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCourses()
    setRefreshing(false)
  }

  useEffect(() => {
    if (!authLoading) {
      loadCourses()
    }
  }, [authLoading])

  const handleEnrollmentChange = () => {
    // Reload courses to reflect enrollment changes
    loadCourses()
  }

  // Filter courses by generation status
  const completedCourses = allCourses.filter(course => course.generation_status === 'completed')
  const generatingCourses = allCourses.filter(course => course.generation_status === 'generating')
  const failedCourses = allCourses.filter(course => course.generation_status === 'failed')

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {user ? 'Discover More Courses' : 'Available Courses'}
            </h2>
            <p className="text-muted-foreground">
              Explore courses created by our community of learners
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading courses...</span>
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
            <h2 className="text-2xl font-bold mb-2">
              {user ? 'Discover More Courses' : 'Available Courses'}
            </h2>
            <p className="text-muted-foreground">
              Explore courses created by our community of learners
            </p>
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
          <h2 className="text-2xl font-bold mb-2">
            {user ? 'Discover More Courses' : 'Available Courses'}
          </h2>
          <p className="text-muted-foreground">
            Explore courses created by our community of learners
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {allCourses.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
          <CardHeader className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl text-muted-foreground">
              No courses available yet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-12">
            <p className="text-muted-foreground max-w-md mx-auto">
              Be the first to create a course! Our AI will generate comprehensive learning materials for any topic.
            </p>
            <Button asChild className="mt-4">
              <a href="/">Create the First Course</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="ready" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ready" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Ready ({completedCourses.length})
            </TabsTrigger>
            <TabsTrigger value="generating" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Generating ({generatingCourses.length})
            </TabsTrigger>
            <TabsTrigger value="failed" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Failed ({failedCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ready" className="mt-6">
            {completedCourses.length === 0 ? (
              <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
                <CardHeader className="text-center py-8">
                  <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl text-muted-foreground">
                    No ready courses yet
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <p className="text-muted-foreground mb-4">
                    Courses are still being generated. Check the "Generating" tab to see progress.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    onEnrollmentChange={handleEnrollmentChange}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="generating" className="mt-6">
            {generatingCourses.length === 0 ? (
              <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
                <CardHeader className="text-center py-8">
                  <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl text-muted-foreground">
                    No courses generating
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <p className="text-muted-foreground mb-4">
                    All courses have finished generating. Create a new course to see it here.
                  </p>
                  <Button asChild>
                    <a href="/">Create New Course</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Courses Being Generated</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                    These courses are currently being created by our AI. This usually takes 2-3 minutes.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatingCourses.map((course) => (
                    <CourseCard 
                      key={course.id} 
                      course={course} 
                      onEnrollmentChange={handleEnrollmentChange}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="failed" className="mt-6">
            {failedCourses.length === 0 ? (
              <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
                <CardHeader className="text-center py-8">
                  <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle className="text-xl text-muted-foreground">
                    No failed generations
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <p className="text-muted-foreground mb-4">
                    All course generations have been successful!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Failed Course Generations</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    These courses failed to generate. You can retry the generation process.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {failedCourses.map((course) => (
                    <CourseCard 
                      key={course.id} 
                      course={course} 
                      onEnrollmentChange={handleEnrollmentChange}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </section>
  )
}