import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CourseWithDetails } from '@/lib/supabase/types'
import { Clock } from 'lucide-react'
import { CourseCard } from '../components/course-card'

interface GeneratingCoursesTabProps {
  courses: CourseWithDetails[]
  onEnrollmentChange: () => void
}

export function GeneratingCoursesTab({ courses, onEnrollmentChange }: GeneratingCoursesTabProps) {
  if (courses.length === 0) {
    return (
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
    )
  }

  return (
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
        {courses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onEnrollmentChange={onEnrollmentChange}
          />
        ))}
      </div>
    </div>
  )
} 