import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CourseWithDetails } from '@/lib/supabase/types'
import { CheckCircle } from 'lucide-react'
import { CourseCard } from '../components/course-card'

interface FailedCoursesTabProps {
  courses: CourseWithDetails[]
  onEnrollmentChange: () => void
}

export function FailedCoursesTab({ courses, onEnrollmentChange }: FailedCoursesTabProps) {
  if (courses.length === 0) {
    return (
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
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <div className="h-5 w-5">⚠️</div>
          <span className="font-medium">Failed Course Generations</span>
        </div>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">
          These courses failed to generate. You can retry the generation process.
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