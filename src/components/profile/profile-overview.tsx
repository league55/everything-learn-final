import { ProfileHeader } from './profile-header'
import { LearningProgress } from './learning-progress'
import { Achievements } from './achievements'
import type { User } from '@supabase/supabase-js'

interface ProfileOverviewProps {
  user: User
  // Remove courses and syllabi props since components will fetch their own data
}

export function ProfileOverview({ user }: ProfileOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileHeader user={user} />
      <LearningProgress />
      <Achievements />
    </div>
  )
}