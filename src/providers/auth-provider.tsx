import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { authStorage } from '@/lib/auth-storage'
import { PendingCourseManager } from '@/lib/pending-course'
import { dbOperations } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPendingCourse, setProcessingPendingCourse] = useState(false)

  // Create a ref for toast to avoid dependency issues
  const toastRef = useToast()

  // Function to handle pending course creation
  const handlePendingCourse = async (authenticatedUser: User) => {
    const pendingConfig = PendingCourseManager.getPendingConfig()
    
    if (!pendingConfig) return
    
    console.log('Found pending course config:', pendingConfig)
    
    // Validate the pending config
    if (!PendingCourseManager.validateConfig(pendingConfig)) {
      console.error('Invalid pending course config')
      PendingCourseManager.clearPendingConfig()
      return
    }

    setProcessingPendingCourse(true)

    try {
      toastRef.toast({
        title: "Creating your course!",
        description: `We're now generating your course "${pendingConfig.topic}". This will take a few minutes.`,
        duration: 6000,
      })

      // Create course configuration
      const courseConfig = await dbOperations.createCourseConfiguration({
        topic: pendingConfig.topic,
        context: pendingConfig.context,
        depth: pendingConfig.depth
      })

      // Create initial syllabus record and enqueue generation job
      await dbOperations.createSyllabus(courseConfig.id)

      // Clear the pending config
      PendingCourseManager.clearPendingConfig()

      toastRef.toast({
        title: "Course Created Successfully!",
        description: `Your course "${pendingConfig.topic}" is being generated. Check the courses page to track progress.`,
        duration: 8000,
      })

      console.log('Successfully created course from pending config')

    } catch (error) {
      console.error('Failed to create course from pending config:', error)
      
      toastRef.toast({
        title: "Failed to Create Course",
        description: error instanceof Error ? error.message : "Please try creating your course again.",
        variant: "destructive",
        duration: 8000,
      })
      
      // Don't clear the pending config on error, so user can retry
    } finally {
      setProcessingPendingCourse(false)
    }
  }

  useEffect(() => {
    console.log('AuthProvider mounted')
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      console.log('Getting initial session...')
      try {
        // First try to get the session from Supabase
        console.log('Calling supabase.auth.getSession()')
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting initial session:', error)
          throw error
        }

        console.log('Supabase session response:', {
          hasSession: !!initialSession,
          userEmail: initialSession?.user?.email,
          expiresAt: initialSession?.expires_at
        })

        if (mounted) {
          if (initialSession) {
            console.log('Setting initial session and user')
            setSession(initialSession)
            setUser(initialSession.user)
            
            // Update stored auth data
            try {
              console.log('Updating stored auth data')
              await authStorage.updateStoredAuthData(initialSession.user, initialSession)
              console.log('Stored auth data updated successfully')
              
              // Check for pending course after authentication
              if (!processingPendingCourse) {
                await handlePendingCourse(initialSession.user)
              }
            } catch (error) {
              console.error('Error updating stored auth data:', error)
            }
          } else {
            console.log('No initial session found, checking stored auth data')
            // If no session from Supabase, try to get from stored auth data
            const storedAuth = authStorage.getStoredAuthData()
            if (storedAuth) {
              console.log('Found stored auth data:', {
                userEmail: storedAuth.user.email,
                expiresAt: storedAuth.expiresAt
              })
              setSession(storedAuth.session)
              setUser(storedAuth.user)
            } else {
              console.log('No stored auth data found')
              setSession(null)
              setUser(null)
            }
          }
          console.log('Setting loading to false after initial session check')
          setLoading(false)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (mounted) {
          console.log('Clearing session and user due to error')
          setSession(null)
          setUser(null)
          authStorage.clearStoredAuthData()
          console.log('Setting loading to false after error')
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    console.log('Setting up auth state change listener')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', {
          event,
          userEmail: session?.user?.email,
          expiresAt: session?.expires_at
        })
        
        if (!mounted) {
          console.log('Component unmounted, ignoring auth state change')
          return
        }

        console.log('Processing auth state change...')
        
        try {
          if (session) {
            console.log('Setting new session and user')
            setSession(session)
            setUser(session.user)
            
            // Update stored auth data
            try {
              console.log('Updating stored auth data after state change')
              await authStorage.updateStoredAuthData(session.user, session)
              console.log('Stored auth data updated successfully')
              
              // Check for pending course on sign in events
              if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && !processingPendingCourse) {
                await handlePendingCourse(session.user)
              }
            } catch (error) {
              console.error('Error updating stored auth data:', error)
            }
          } else {
            console.log('Clearing session and user after state change')
            setSession(null)
            setUser(null)
            authStorage.clearStoredAuthData()
          }
        } catch (error) {
          console.error('Error processing auth state change:', error)
        } finally {
          console.log('Setting loading to false after state change')
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('AuthProvider unmounting')
      mounted = false
      subscription.unsubscribe()
    }
  }, [processingPendingCourse]) // Add processingPendingCourse to dependencies

  const signOut = async () => {
    console.log('Signing out...')
    try {
      setLoading(true)
      await supabase.auth.signOut()
      console.log('Supabase sign out successful')
      setUser(null)
      setSession(null)
      authStorage.clearStoredAuthData()
      // Clear any pending course config on sign out
      PendingCourseManager.clearPendingConfig()
      console.log('Local state cleared')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
      console.log('Sign out complete')
    }
  }

  // Log the current state whenever it changes
  useEffect(() => {
    console.log('Auth state updated:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasSession: !!session,
      loading,
      processingPendingCourse
    })
  }, [user, session, loading, processingPendingCourse])

  const value = {
    user,
    session,
    loading,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}