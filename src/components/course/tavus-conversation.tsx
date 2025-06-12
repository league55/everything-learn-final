import { useEffect, useRef, useState } from 'react'
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
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TavusConversationProps {
  conversationUrl: string
  conversationType: 'practice' | 'exam'
  onConversationEnd: (transcript?: string) => void
  onError: (error: string) => void
}

// Use a property on window to store the singleton
declare global {
  interface Window {
    _dailyCallObject?: any
  }
}

const getOrCreateCallObject = () => {
  if (!window._dailyCallObject) {
    window._dailyCallObject = DailyIframe.createCallObject()
  }
  return window._dailyCallObject
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

  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Get or create call object
        const call = getOrCreateCallObject()
        callRef.current = call

        console.log('Joining Tavus conversation:', conversationUrl)

        // Set up event listeners
        call.on('joined-meeting', () => {
          console.log('Successfully joined meeting')
          setIsConnecting(false)
          setIsConnected(true)
          setCallState('joined')
        })

        call.on('left-meeting', () => {
          console.log('Left meeting')
          setIsConnected(false)
          setCallState('left')
          onConversationEnd()
        })

        call.on('error', (error: any) => {
          console.error('Daily call error:', error)
          setIsConnecting(false)
          onError(`Call error: ${error.message || 'Unknown error'}`)
        })

        call.on('participant-joined', updateParticipants)
        call.on('participant-updated', updateParticipants)
        call.on('participant-left', updateParticipants)

        // Join the meeting
        await call.join({ url: conversationUrl })

      } catch (error) {
        console.error('Failed to initialize call:', error)
        setIsConnecting(false)
        onError(`Failed to join conversation: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    const updateParticipants = () => {
      const call = callRef.current
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

    initializeCall()

    // Cleanup
    return () => {
      const call = callRef.current
      if (call && callState !== 'left') {
        call.leave()
      }
    }
  }, [conversationUrl, onConversationEnd, onError])

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
    if (!call) return

    call.leave()
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Connecting to your expert...</h3>
          <p className="text-muted-foreground">
            Please allow camera and microphone access when prompted
          </p>
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
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            onClick={toggleVideo}
            variant={isVideoOff ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full h-12 w-12"
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