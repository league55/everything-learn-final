import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { courseStorage } from '@/lib/course-storage'
import { dbOperations } from '@/lib/supabase'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { Info, X, Loader2 } from 'lucide-react'

export function PendingCourseBanner() {
  const [pendingCourse, setPendingCourse] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      const pending = courseStorage.getPendingCourse()
      setPendingCourse(pending)
    }
  }, [user])

  const handleSubmit = async () => {
    if (!pendingCourse || !user) return

    setSubmitting(true)
    try {
      // Create course configuration
      const courseConfig = await dbOperations.createCourseConfiguration({
        topic: pendingCourse.topic.trim(),
        context: pendingCourse.context.trim(),
        depth: pendingCourse.depth
      })

      // Create initial syllabus record and enqueue generation job
      await dbOperations.createSyllabus(courseConfig.id)

      // Clear pending course data
      courseStorage.clearPendingCourse()
      setPendingCourse(null)

      toast({
        title: "Course Generation Started!",
        description: `Your course "${pendingCourse.topic}" is being generated.`,
        duration: 5000,
      })

      // Refresh the page to show the new course
      window.location.reload()

    } catch (error) {
      console.error('Failed to submit pending course:', error)
      toast({
        title: "Failed to Create Course",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDismiss = () => {
    courseStorage.clearPendingCourse()
    setPendingCourse(null)
  }

  if (!pendingCourse || !user) return null

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            <strong>Saved Course:</strong> "{pendingCourse.topic}" - Ready to generate your course?
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Course'
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDismiss}
            disabled={submitting}
            className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  )
}