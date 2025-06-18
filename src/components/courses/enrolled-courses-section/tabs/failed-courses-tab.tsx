import type { CourseWithDetails } from '@/lib/supabase'
import { CheckCircle } from 'lucide-react'
import { EmptyStateCard } from '../components/empty-state-card'
import { CourseCard } from '../components/course-card'

interface FailedCoursesTabProps {
  courses: CourseWithDetails[]
  onRetryGeneration: (courseId: string) => void
}

export function FailedCoursesTab({ courses, onRetryGeneration }: FailedCoursesTabProps) {
  if (courses.length === 0) {
    return (
      <EmptyStateCard
        icon={CheckCircle}
        title="No failed generations"
        description="All your course generations have been successful!"
        iconColor="text-green-500"
      />
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            variant="failed"
            onRetryGeneration={onRetryGeneration}
          />
        ))}
      </div>
    </div>
  )
} 