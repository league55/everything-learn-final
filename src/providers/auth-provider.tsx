import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { authStorage } from '@/lib/auth-storage'
import { courseStorage } from '@/lib/course-storage'
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
  const [hasProcessedPendingCourse, setHasProcessedPendingCourse] = useState(false)
  const { toast } = useToast()

  // Handle pending course submission after authentication
  const handlePendingCourse = async (authenticatedUser: User) => {
    if (hasProcessedPendingCourse) return

    const pendingCourse = courseStorage.getPendingCourse()
    if (!pendingCourse) {
      setHasProcessedPendingCourse(true)
      return
    }

    try {
      console.log('Processing pending course for authenticated user:', authenticatedUser.email)
      
      // Create course configuration
      const courseConfig = await dbOperations.createCourseConfiguration({
        topic: pendingCourse.topic.trim(),
        context: pendingCourse.context.trim(),
        depth: pendingCourse.depth,
        user_id: authenticatedUser.id
      })

      // Create initial syllabus record and enqueue generation job
      await dbOperations.createSyllabus(courseConfig.id)

      // Automatically enroll the course creator
      try {
        await dbOperations.enrollInCourse(courseConfig.id, authenticatedUser.id)
        console.log('Course creator automatically enrolled in course:', courseConfig.id)
      } catch (enrollError) {
        console.warn('Failed to auto-enroll course creator, but course was created successfully:', enrollError)
        // Don't throw error - course creation was successful
      }

      // Clear pending course data
      courseStorage.clearPendingCourse()

      toast({
        title: "Course Created & Enrolled!",
        description: `Your course "${pendingCourse.topic}" is being generated. You're automatically enrolled and can track progress.`,
        duration: 5000,
      })

      console.log('Pending course processed successfully:', courseConfig.id)
      
    } catch (error) {
      console.error('Failed to process pending course:', error)
      toast({
        title: "Failed to Create Course",
        description: "There was an issue creating your course. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setHasProcessedPendingCourse(true)
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
            } catch (error) {
              console.error('Error updating stored auth data:', error)
            }

            // Handle pending course
            await handlePendingCourse(initialSession.user)
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
              
              // Handle pending course
              await handlePendingCourse(storedAuth.user)
            } else {
              console.log('No stored auth data found')
              setSession(null)
              setUser(null)
              setHasProcessedPendingCourse(true)
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
          setHasProcessedPendingCourse(true)
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
            } catch (error) {
              console.error('Error updating stored auth data:', error)
            }

            // Handle pending course for new authentication
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              setHasProcessedPendingCourse(false)
              await handlePendingCourse(session.user)
            }
          } else {
            console.log('Clearing session and user after state change')
            setSession(null)
            setUser(null)
            authStorage.clearStoredAuthData()
            setHasProcessedPendingCourse(false)
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
  }, [])

  const signOut = async () => {
    console.log('Signing out...')
    try {
      setLoading(true)
      await supabase.auth.signOut()
      console.log('Supabase sign out successful')
      setUser(null)
      setSession(null)
      authStorage.clearStoredAuthData()
      setHasProcessedPendingCourse(false)
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
      hasProcessedPendingCourse
    })
  }, [user, session, loading, hasProcessedPendingCourse])

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