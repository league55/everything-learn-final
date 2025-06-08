import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  X, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Phone, 
  PhoneOff,
  Loader2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CviInterfaceModalProps {
  tavusConversationId: string
  tavusReplicaId: string
  conversationType: 'practice' | 'exam'
  onClose: () => void
  onComplete?: () => void
}

export function CviInterfaceModal({
  tavusConversationId,
  tavusReplicaId,
  conversationType,
  onClose,
  onComplete
}: CviInterfaceModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)

  // Construct the Tavus CVI embed URL
  const embedUrl = `https://cvi.tavus.io/embed?replicaId=${tavusReplicaId}&conversationId=${tavusConversationId}`

  useEffect(() => {
    // Simulate loading time for the iframe
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
      setIsConnected(true)
    }, 3000)

    // Listen for messages from the iframe (if Tavus provides postMessage API)
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://cvi.tavus.io') return

      const { type, data } = event.data
      
      switch (type) {
        case 'conversation_started':
          setIsConnected(true)
          setIsLoading(false)
          break
        case 'conversation_ended':
          setSessionEnded(true)
          if (onComplete) {
            setTimeout(onComplete, 2000)
          }
          break
        case 'error':
          setHasError(true)
          setIsLoading(false)
          break
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      clearTimeout(loadingTimer)
      window.removeEventListener('message', handleMessage)
    }
  }, [onComplete])

  const handleEndSession = () => {
    setSessionEnded(true)
    if (onComplete) {
      setTimeout(onComplete, 1000)
    }
  }

  const isExam = conversationType === 'exam'

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-full max-h-[90vh] bg-card border-2 border-primary/20 shadow-2xl flex flex-col">
        <CardHeader className="flex-shrink-0 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-3 w-3 rounded-full",
                isConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500"
              )} />
              <CardTitle className="text-lg md:text-xl">
                {isExam ? 'Oral Examination' : 'Practice Conversation'}
              </CardTitle>
              {isConnected && (
                <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Connected</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isConnected && !sessionEnded && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndSession}
                  className="flex items-center gap-2"
                >
                  <PhoneOff className="h-4 w-4" />
                  <span className="hidden sm:inline">End Session</span>
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 relative overflow-hidden">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <div>
                  <h3 className="font-semibold mb-2">Connecting to your expert...</h3>
                  <p className="text-sm text-muted-foreground">
                    Please allow camera and microphone access when prompted
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10">
              <div className="text-center space-y-4 max-w-md">
                <AlertTriangle className="h-8 w-8 mx-auto text-destructive" />
                <div>
                  <h3 className="font-semibold mb-2">Connection Error</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Unable to connect to the video session. Please check your internet connection and try again.
                  </p>
                  <Button onClick={onClose} variant="outline">
                    Close and Retry
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Session Ended State */}
          {sessionEnded && (
            <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10">
              <div className="text-center space-y-4 max-w-md">
                <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                <div>
                  <h3 className="font-semibold mb-2">Session Complete</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isExam 
                      ? 'Your examination has been completed. Results will be processed shortly.'
                      : 'Great conversation! You\'ve successfully completed the practice session.'
                    }
                  </p>
                  <Button onClick={onClose}>
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tavus CVI Iframe */}
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allow="microphone; camera; autoplay; display-capture"
            allowFullScreen
            title={`${isExam ? 'Oral Examination' : 'Practice Conversation'} with AI Expert`}
            onLoad={() => {
              // Additional loading handling if needed
              setTimeout(() => setIsLoading(false), 1000)
            }}
            onError={() => setHasError(true)}
          />

          {/* Controls Overlay */}
          {isConnected && !sessionEnded && !hasError && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 rounded-full px-4 py-2 flex items-center gap-3">
              <div className="flex items-center gap-2 text-white text-sm">
                <Video className="h-4 w-4" />
                <Mic className="h-4 w-4" />
                <span className="hidden sm:inline">Live Session</span>
              </div>
            </div>
          )}
        </CardContent>

        {/* Instructions Footer */}
        {!sessionEnded && !hasError && (
          <div className="flex-shrink-0 border-t border-border/50 p-4 bg-muted/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  <span>Camera required</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mic className="h-3 w-3" />
                  <span>Microphone required</span>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <p className="text-xs">
                  {isExam 
                    ? 'Speak clearly and take your time to answer questions'
                    : 'Relax and enjoy the conversation about your learning'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}