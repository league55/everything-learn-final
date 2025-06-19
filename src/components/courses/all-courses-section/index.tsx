import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/providers/auth-provider'
import { courseDb } from '@/lib/supabase/db'
import type { CourseWithDetails } from '@/lib/supabase/types'
import { 
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { SectionHeader } from '../shared/section-header'
import { LoadingState } from '../shared/loading-state'
import { ErrorState } from '../shared/error-state'
import { ReadyCoursesTab } from './tabs/ready-courses-tab'
import { GeneratingCoursesTab } from './tabs/generating-courses-tab'
import { FailedCoursesTab } from './tabs/failed-courses-tab'

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
      const courses = await courseDb.getAllCourses()
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
      <LoadingState
        title={user ? 'Discover More Courses' : 'Available Courses'}
        description="Explore courses created by our community of learners"
        message="Loading courses..."
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title={user ? 'Discover More Courses' : 'Available Courses'}
        description="Explore courses created by our community of learners"
        error={error}
      />
    )
  }

  return (
    <section>
      <SectionHeader
        title={user ? 'Discover More Courses' : 'Available Courses'}
        description="Explore courses created by our community of learners"
        showRefreshButton={true}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

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
            <ReadyCoursesTab 
              courses={completedCourses}
              onEnrollmentChange={handleEnrollmentChange}
            />
          </TabsContent>

          <TabsContent value="generating" className="mt-6">
            <GeneratingCoursesTab 
              courses={generatingCourses}
              onEnrollmentChange={handleEnrollmentChange}
            />
          </TabsContent>

          <TabsContent value="failed" className="mt-6">
            <FailedCoursesTab 
              courses={failedCourses}
              onEnrollmentChange={handleEnrollmentChange}
            />
          </TabsContent>
        </Tabs>
      )}
    </section>
  )
} 