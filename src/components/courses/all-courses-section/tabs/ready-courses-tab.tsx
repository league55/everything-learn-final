import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CourseWithDetails } from '@/lib/supabase/types'
import { CheckCircle } from 'lucide-react'
import { CourseCard } from '../components/course-card'

interface ReadyCoursesTabProps {
  courses: CourseWithDetails[]
  onEnrollmentChange: () => void
}

export function ReadyCoursesTab({ courses, onEnrollmentChange }: ReadyCoursesTabProps) {
  if (courses.length === 0) {
    return (
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
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard 
          key={course.id} 
          course={course} 
          onEnrollmentChange={onEnrollmentChange}
        />
      ))}
    </div>
  )
} 