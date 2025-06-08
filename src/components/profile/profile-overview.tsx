import { useState, useEffect } from 'react'
import { ProfileHeader } from './profile-header'
import { LearningProgress } from './learning-progress'
import { Achievements } from './achievements'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { useAuth } from '@/providers/auth-provider'

interface ProfileOverviewProps {
  user: User
}

export function ProfileOverview({ user }: ProfileOverviewProps) {
  const { user: currentUser, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  // Ensure we're showing data for the correct user
  useEffect(() => {
    if (!loading && (!currentUser || currentUser.id !== user.id)) {
      setError('User authentication mismatch. Please refresh the page.')
    } else {
      setError(null)
    }
  }, [currentUser, user, loading])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading progress...</span>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading achievements...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Use currentUser to ensure we have the most up-to-date user data
  const displayUser = currentUser || user

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileHeader user={displayUser} />
      <LearningProgress />
      <Achievements />
    </div>
  )
}