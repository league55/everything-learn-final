import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { PendingCourseManager } from '@/lib/pending-course'
import { X, Clock } from 'lucide-react'

export function PendingCourseNotification() {
  const [pendingConfig, setPendingConfig] = useState<any>(null)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const config = PendingCourseManager.getPendingConfig()
    if (config) {
      setPendingConfig(config)
      setShowNotification(true)
    }
  }, [])

  const handleDismiss = () => {
    setShowNotification(false)
  }

  const handleClearPending = () => {
    PendingCourseManager.clearPendingConfig()
    setShowNotification(false)
    setPendingConfig(null)
  }

  if (!showNotification || !pendingConfig) {
    return null
  }

  return (
    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <span className="font-medium text-blue-800 dark:text-blue-200">
            Course creation in progress: "{pendingConfig.topic}"
          </span>
          <br />
          <span className="text-blue-600 dark:text-blue-300 text-sm">
            Your course will be created automatically after you sign in.
          </span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearPending}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}