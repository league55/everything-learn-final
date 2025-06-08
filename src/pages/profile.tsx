import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/providers/auth-provider'
import { ProfileOverview } from '@/components/profile/profile-overview'
import { CourseList } from '@/components/profile/course-list'
import { AccountSettings } from '@/components/profile/account-settings'
import { Loader2 } from 'lucide-react'

export function ProfilePage() {
  const { user, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your profile...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertDescription>Please sign in to view your profile.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Profile</h1>
          <p className="text-xl text-muted-foreground">
            Manage your learning journey and track your progress.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Learning</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProfileOverview user={user} />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Learning Progress</h2>
                <p className="text-muted-foreground">Courses you're currently enrolled in</p>
              </div>
              <Button asChild>
                <a href="/courses">Browse More Courses</a>
              </Button>
            </div>
            <CourseList />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <AccountSettings user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}