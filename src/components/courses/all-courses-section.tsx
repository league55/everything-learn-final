import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/providers/auth-provider'
import { dbOperations } from '@/lib/supabase'
import type { CourseWithDetails } from '@/lib/supabase'
import { CourseCard } from './course-card'
import { 
  BookOpen,
  Loader2
} from 'lucide-react'

export function AllCoursesSection() {
  const [allCourses, setAllCourses] = useState<CourseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user, loading: authLoading } = useAuth()

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load all public courses
      const publicCourses = await dbOperations.getAllCourses()
      setAllCourses(publicCourses)

    } catch (err) {
      console.error('Failed to load courses:', err)
      setError('Failed to load courses. Please try again.')
    } finally {
      setLoading(false)
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onEnrollmentChange={handleEnrollmentChange}
            />
          ))}
        </div>
      )}
    </section>
  )
}