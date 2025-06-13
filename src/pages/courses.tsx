import { useAuth } from '@/providers/auth-provider'
import { CoursesHeader } from '@/components/courses/courses-header'
import { EnrolledCoursesSection } from '@/components/courses/enrolled-courses-section'
import { AllCoursesSection } from '@/components/courses/all-courses-section'
import { Loader2 } from 'lucide-react'

export function CoursesPage() {
  const { user, loading: authLoading } = useAuth()

  console.log('CoursesPage render:', { user: user?.email, authLoading })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading courses...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <CoursesHeader 
          title="Course Library"
          description="Discover AI-powered courses and track your learning progress."
        />

        {/* Enrolled Courses Section - Only show for authenticated users */}
        {user && <EnrolledCoursesSection />}

        {/* All Courses Section */}
        <AllCoursesSection />
      </div>
    </div>
  )
}