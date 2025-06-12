import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dbOperations } from '@/lib/supabase'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'
import type { CourseData } from './course-data-loader'

interface UseCviSessionResult {
  showFinalTestButton: boolean
  showCviModal: boolean
  tavusConversationId: string | null
  tavusReplicaId: string | null
  cviConversationType: 'practice' | 'exam'
  isInitiatingCvi: boolean
  setShowFinalTestButton: (show: boolean) => void
  handleInitiateTest: (conversationType: 'practice' | 'exam') => Promise<void>
  handleCviComplete: () => Promise<void>
  handleCloseCvi: () => void
}

export function useCviSession(
  courseData: CourseData | null,
  selectedModuleIndex: number,
  setCourseReadyForCompletion: (ready: boolean) => void
): UseCviSessionResult {
  const [showFinalTestButton, setShowFinalTestButton] = useState(false)
  const [showCviModal, setShowCviModal] = useState(false)
  const [tavusConversationId, setTavusConversationId] = useState<string | null>(null)
  const [tavusReplicaId, setTavusReplicaId] = useState<string | null>(null)
  const [cviConversationType, setCviConversationType] = useState<'practice' | 'exam'>('practice')
  const [isInitiatingCvi, setIsInitiatingCvi] = useState(false)

  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleInitiateTest = async (conversationType: 'practice' | 'exam') => {
    if (!courseData || !user) return

    setIsInitiatingCvi(true)
    setCviConversationType(conversationType)

    try {
      const userName = user.email?.split('@')[0] || user.user_metadata?.name || 'Student'
      const currentModule = courseData.syllabus.modules[selectedModuleIndex]
      
      const response = await dbOperations.initiateTavusCviSession(
        courseData.configuration.id,
        user.id,
        userName,
        courseData.configuration.depth,
        conversationType,
        courseData.configuration.topic,
        currentModule.summary
      )

      setTavusConversationId(response.conversation_id)
      setTavusReplicaId(response.replica_id)
      setShowFinalTestButton(false)
      setShowCviModal(true)

      toast({
        title: "Session Initiated",
        description: "Connecting you with your AI expert...",
        duration: 3000,
      })

    } catch (err) {
      console.error('Failed to initiate CVI session:', err)
      toast({
        title: "Connection Failed",
        description: err instanceof Error ? err.message : "Failed to start video session",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsInitiatingCvi(false)
    }
  }

  const handleCviComplete = async () => {
    if (!courseData) return

    try {
      // Now actually mark the course as completed in the database
      await dbOperations.updateCourseProgress(
        courseData.enrollment.id,
        selectedModuleIndex,
        true // Mark as completed
      )

      setShowCviModal(false)
      setTavusConversationId(null)
      setTavusReplicaId(null)
      setCourseReadyForCompletion(false)
      
      toast({
        title: "Congratulations!",
        description: "You have successfully completed the course!",
        duration: 5000,
      })
      
      // Navigate back to courses after a short delay
      setTimeout(() => {
        navigate('/courses')
      }, 2000)

    } catch (err) {
      console.error('Failed to complete course:', err)
      toast({
        title: "Error",
        description: "Failed to mark course as completed",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleCloseCvi = () => {
    setShowCviModal(false)
    setTavusConversationId(null)
    setTavusReplicaId(null)
    setShowFinalTestButton(true) // Allow them to try again
  }

  return {
    showFinalTestButton,
    showCviModal,
    tavusConversationId,
    tavusReplicaId,
    cviConversationType,
    isInitiatingCvi,
    setShowFinalTestButton,
    handleInitiateTest,
    handleCviComplete,
    handleCloseCvi
  }
}