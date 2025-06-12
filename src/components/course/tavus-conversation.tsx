import { useEffect, useRef, useState, useCallback } from 'react'
import DailyIframe from '@daily-co/daily-js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TavusConversationProps {
  conversationUrl: string
  conversationType: 'practice' | 'exam'
  onConversationEnd: (transcript?: string) => void
  onError: (error: string) => void
}

export function TavusConversation({
  conversationUrl,
  conversationType,
  onConversationEnd,
  onError
}: TavusConversationProps) {
  const callRef = useRef<any>(null)
  const [remoteParticipants, setRemoteParticipants] = useState<Record<string, any>>({})
  const [localParticipant, setLocalParticipant] = useState<any>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callState, setCallState] = useState<string>('new')
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const hasJoinedRef = useRef(false)
  const hasLeftRef = useRef(false)

  // Stable callback using useCallback
  const handleConversationEnd = useCallback((transcript?: string) => {
    console.log('Conversation ended, calling onConversationEnd')
    if (!hasLeftRef.current) {
      hasLeftRef.current = true
      onConversationEnd(transcript)
    }
  }, [onConversationEnd])

  const handleError = useCallback((error: string) => {
    console.error('Conversation error:', error)
    setConnectionError(error)
    onError(error)
  }, [onError])

  useEffect(() => {
    let call: any = null
    let joinTimeout: NodeJS.Timeout

    const initializeCall = async () => {
      try {
        console.log('Initializing Tavus conversation with URL:', conversationUrl)
        
        // Create a new call object for this conversation
        call = DailyIframe.createCallObject()
        callRef.current = call

        // Clear any existing state
        setConnectionError(null)
        setIsConnecting(true)
        setIsConnected(false)

        // Set up event listeners
        const handleJoinedMeeting = () => {
          console.log('Successfully joined meeting')
          setIsConnecting(false)
          setIsConnected(true)
          setCallState('joined')
          hasJoinedRef.current = true
          if (joinTimeout) clearTimeout(joinTimeout)
        }

        const handleLeftMeeting = () => {
          console.log('Left meeting')
          setIsConnected(false)
          setCallState('left')
          if (hasJoinedRef.current) {
            // Only call conversation end if we actually joined
            handleConversationEnd()
          }
        }

        const handleCallError = (error: any) => {
          console.error('Daily call error:', error)
          setIsConnecting(false)
          if (joinTimeout) clearTimeout(joinTimeout)
          handleError(`Call error: ${error.message || 'Failed to connect to video call'}`)
        }

        const updateParticipants = () => {
          if (!call) return

          const participants = call.participants()
          const remotes: Record<string, any> = {}
          let local = null

          Object.entries(participants).forEach(([id, p]: [string, any]) => {
            if (id === 'local') {
              local = p
            } else {
              remotes[id] = p
            }
          })

          setRemoteParticipants(remotes)
          setLocalParticipant(local)
        }

        // Add event listeners
        call.on('joined-meeting', handleJoinedMeeting)
        call.on('left-meeting', handleLeftMeeting)
        call.on('error', handleCallError)
        call.on('participant-joined', updateParticipants)
        call.on('participant-updated', updateParticipants)
        call.on('participant-left', updateParticipants)

        // Set a timeout for connection
        joinTimeout = setTimeout(() => {
          if (!hasJoinedRef.current) {
            console.error('Connection timeout - failed to join within 30 seconds')
            handleError('Connection timeout. Please check your internet connection and try again.')
          }
        }, 30000) // 30 second timeout

        console.log('Attempting to join Daily.co call...')
        
        // Join the meeting
        await call.join({ 
          url: conversationUrl,
          // Enable audio and video by default
          startAudioOff: false,
          startVideoOff: false
        })

        console.log('Join request sent successfully')

      } catch (error) {
        console.error('Failed to initialize call:', error)
        setIsConnecting(false)
        if (joinTimeout) clearTimeout(joinTimeout)
        handleError(`Failed to join conversation: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    initializeCall()

    // Cleanup function
    return () => {
      console.log('Cleaning up Tavus conversation component')
      if (joinTimeout) clearTimeout(joinTimeout)
      
      if (call && !hasLeftRef.current) {
        console.log('Destroying call during cleanup')
        try {
          call.destroy()
        } catch (error) {
          console.error('Error destroying call during cleanup:', error)
        }
      }
    }
  }, [conversationUrl]) // Only depend on conversationUrl

  // Attach remote video and audio tracks
  useEffect(() => {
    Object.entries(remoteParticipants).forEach(([id, p]) => {
      // Video
      const videoEl = document.getElementById(`remote-video-${id}`) as HTMLVideoElement
      if (videoEl && p.tracks?.video?.state === 'playable' && p.tracks.video.persistentTrack) {
        videoEl.srcObject = new MediaStream([p.tracks.video.persistentTrack])
      }
      
      // Audio
      const audioEl = document.getElementById(`remote-audio-${id}`) as HTMLAudioElement
      if (audioEl && p.tracks?.audio?.state === 'playable' && p.tracks.audio.persistentTrack) {
        audioEl.srcObject = new MediaStream([p.tracks.audio.persistentTrack])
      }
    })
  }, [remoteParticipants])

  const toggleMute = () => {
    const call = callRef.current
    if (!call) return

    const newMuted = !isMuted
    call.setLocalAudio(!newMuted)
    setIsMuted(newMuted)
  }

  const toggleVideo = () => {
    const call = callRef.current
    if (!call) return

    const newVideoOff = !isVideoOff
    call.setLocalVideo(!newVideoOff)
    setIsVideoOff(newVideoOff)
  }

  const leaveCall = () => {
    const call = callRef.current
    if (!call || hasLeftRef.current) return

    console.log('User manually leaving call')
    hasLeftRef.current = true
    call.leave()
  }

  // Show error state
  if (connectionError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            {connectionError}
          </p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  // Show connecting state
  if (isConnecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Connecting to your expert...</h3>
          <p className="text-muted-foreground mb-4">
            Please allow camera and microphone access when prompted
          </p>
          <div className="text-xs text-muted-foreground">
            This may take up to 30 seconds
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Badge variant={conversationType === 'exam' ? 'destructive' : 'secondary'}>
            {conversationType === 'exam' ? 'Oral Examination' : 'Practice Session'}
          </Badge>
          {isConnected && (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live
            </div>
          )}
        </div>
        
        <Button 
          onClick={leaveCall}
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <PhoneOff className="h-4 w-4" />
          End Session
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">
          {/* Remote Participants (AI Expert) */}
          {Object.entries(remoteParticipants).map(([id, p]) => (
            <Card key={id} className="relative bg-gray-800 border-gray-700 overflow-hidden aspect-video">
              <video
                id={`remote-video-${id}`}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <audio id={`remote-audio-${id}`} autoPlay playsInline />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 px-3 py-1 rounded text-sm font-medium">
                AI Expert
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant="outline" className="bg-black bg-opacity-70">
                  {conversationType === 'exam' ? 'Examiner' : 'Mentor'}
                </Badge>
              </div>
            </Card>
          ))}

          {/* Local Participant (User) */}
          {localParticipant && (
            <Card className="relative bg-gray-800 border-gray-700 overflow-hidden aspect-video">
              <video
                ref={(el) => {
                  if (el && localParticipant.tracks?.video?.persistentTrack) {
                    el.srcObject = new MediaStream([localParticipant.tracks.video.persistentTrack])
                  }
                }}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover",
                  isVideoOff && "hidden"
                )}
              />
              {isVideoOff && (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <VideoOff className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 px-3 py-1 rounded text-sm font-medium">
                You
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                {isMuted && (
                  <Badge variant="destructive" className="bg-red-600">
                    <MicOff className="h-3 w-3 mr-1" />
                    Muted
                  </Badge>
                )}
                {isVideoOff && (
                  <Badge variant="secondary" className="bg-gray-600">
                    <VideoOff className="h-3 w-3 mr-1" />
                    Camera Off
                  </Badge>
                )}
              </div>
            </Card>
          )}

          {/* Show message if no participants yet */}
          {!isConnected && Object.keys(remoteParticipants).length === 0 && (
            <Card className="col-span-full bg-gray-800 border-gray-700 p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Waiting for expert to join...</h3>
              <p className="text-gray-400">Your AI expert will appear here shortly</p>
            </Card>
          )}
        </div>
      </main>

      {/* Controls */}
      <footer className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex justify-center items-center gap-4">
          <Button
            onClick={toggleMute}
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full h-12 w-12"
            disabled={!isConnected}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            onClick={toggleVideo}
            variant={isVideoOff ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full h-12 w-12"
            disabled={!isConnected}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          <Button
            onClick={leaveCall}
            variant="destructive"
            size="lg"
            className="rounded-full h-12 w-12"
          >
            <Phone className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="text-center mt-4 text-sm text-gray-400">
          {conversationType === 'exam' 
            ? 'Answer questions clearly and take your time to explain your thoughts'
            : 'Relax and enjoy discussing what you\'ve learned'
          }
        </div>
      </footer>
    </div>
  )
}