import type { CourseWithDetails } from '@/lib/supabase'
import { Award } from 'lucide-react'
import { EmptyStateCard } from '../components/empty-state-card'
import { CourseCard } from '../components/course-card'

interface CompletedCoursesTabProps {
  courses: CourseWithDetails[]
  onContinueLearning: (courseId: string) => void
}

export function CompletedCoursesTab({ courses, onContinueLearning }: CompletedCoursesTabProps) {
  if (courses.length === 0) {
    return (
      <EmptyStateCard
        icon={Award}
        title="No completed courses yet"
        description="Complete your active courses to see them here for review."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          variant="completed"
          onContinueLearning={onContinueLearning}
        />
      ))}
    </div>
  )
} 