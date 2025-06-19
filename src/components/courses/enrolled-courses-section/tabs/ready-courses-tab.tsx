import type { CourseWithDetails } from '@/lib/supabase/types'
import { BookOpen } from 'lucide-react'
import { EmptyStateCard } from '../components/empty-state-card'
import { CourseCard } from '../components/course-card'

interface ReadyCoursesTabProps {
  courses: CourseWithDetails[]
  onContinueLearning: (courseId: string) => void
}

export function ReadyCoursesTab({ courses, onContinueLearning }: ReadyCoursesTabProps) {
  if (courses.length === 0) {
    return (
      <EmptyStateCard
        icon={BookOpen}
        title="No ready courses"
        description="Your enrolled courses are still being generated. Check the 'Generating' tab for progress."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          variant="ready"
          onContinueLearning={onContinueLearning}
        />
      ))}
    </div>
  )
} 