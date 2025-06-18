import type { CourseWithDetails } from '@/lib/supabase'
import { Clock } from 'lucide-react'
import { EmptyStateCard } from '../components/empty-state-card'
import { CourseCard } from '../components/course-card'

interface GeneratingCoursesTabProps {
  courses: CourseWithDetails[]
}

export function GeneratingCoursesTab({ courses }: GeneratingCoursesTabProps) {
  if (courses.length === 0) {
    return (
      <EmptyStateCard
        icon={Clock}
        title="No courses generating"
        description="All your enrolled courses have finished generating."
      />
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
          These courses are currently being created. You'll be able to start learning once they're complete.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            variant="generating"
          />
        ))}
      </div>
    </div>
  )
} 