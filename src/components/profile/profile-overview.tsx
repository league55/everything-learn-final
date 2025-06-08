import { ProfileHeader } from './profile-header'
import { LearningProgress } from './learning-progress'
import { Achievements } from './achievements'
import type { User } from '@supabase/supabase-js'
import type { CourseConfiguration, Syllabus } from '@/lib/supabase'

interface ProfileOverviewProps {
  user: User
  courses: CourseConfiguration[]
  syllabi: Record<string, Syllabus>
}

export function ProfileOverview({ user, courses, syllabi }: ProfileOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileHeader user={user} />
      <LearningProgress courses={courses} syllabi={syllabi} />
      <Achievements courses={courses} syllabi={syllabi} />
    </div>
  )
}