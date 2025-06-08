import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Award, Target, GraduationCap, BookOpen, Users, Star, Zap } from 'lucide-react'
import { dbOperations } from '@/lib/supabase'
import { useAuth } from '@/providers/auth-provider'
import type { CourseWithDetails } from '@/lib/supabase'

export function Achievements() {
  const { user } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithDetails[]>([])
  const [createdCourses, setCreatedCourses] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAchievementData = async () => {
      if (!user) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Load enrolled courses
        const userEnrolledCourses = await dbOperations.getUserEnrolledCourses()
        setEnrolledCourses(userEnrolledCourses)
        
        // Load created courses count
        const userCreatedCourses = await dbOperations.getCourseConfigurations()
        setCreatedCourses(userCreatedCourses.length)
        
      } catch (err) {
        console.error('Failed to load achievement data:', err)
        setError('Failed to load achievements data')
      } finally {
        setLoading(false)
      }
    }

    loadAchievementData()
  }, [user])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Calculate achievement conditions
  const hasCompletedCourse = enrolledCourses.some(course => 
    course.user_enrollment?.status === 'completed'
  )
  const hasCreatedCourses = createdCourses >= 5
  const hasEnrolledInCourses = enrolledCourses.length > 0
  const isActiveLearner = enrolledCourses.length >= 3
  const isFirstCourseCreated = createdCourses > 0
  const completedCoursesCount = enrolledCourses.filter(course => 
    course.user_enrollment?.status === 'completed'
  ).length
  const isCompletionChampion = completedCoursesCount >= 3

  const achievements = [
    {
      id: 'first-course',
      name: 'First Course Created',
      description: 'Created your first course',
      icon: Target,
      unlocked: isFirstCourseCreated,
      variant: 'secondary' as const
    },
    {
      id: 'learning-started',
      name: 'Learning Journey Started',
      description: 'Enrolled in your first course',
      icon: Users,
      unlocked: hasEnrolledInCourses,
      variant: 'secondary' as const
    },
    {
      id: 'first-completion',
      name: 'Course Completed',
      description: 'Completed your first course',
      icon: GraduationCap,
      unlocked: hasCompletedCourse,
      variant: 'secondary' as const
    },
    {
      id: 'active-learner',
      name: 'Active Learner',
      description: 'Enrolled in 3+ courses',
      icon: BookOpen,
      unlocked: isActiveLearner,
      variant: 'secondary' as const,
      requirement: 'Enroll in 3+ courses'
    },
    {
      id: 'course-creator',
      name: 'Course Creator',
      description: 'Created 5+ courses',
      icon: Star,
      unlocked: hasCreatedCourses,
      variant: 'secondary' as const,
      requirement: 'Create 5+ courses'
    },
    {
      id: 'completion-champion',
      name: 'Completion Champion',
      description: 'Completed 3+ courses',
      icon: Zap,
      unlocked: isCompletionChampion,
      variant: 'secondary' as const,
      requirement: 'Complete 3+ courses'
    }
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Achievements
          <Badge variant="outline" className="ml-auto">
            {unlockedCount}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {achievements.map((achievement) => (
          <Badge 
            key={achievement.id}
            variant={achievement.unlocked ? achievement.variant : "outline"} 
            className={`w-full justify-start ${!achievement.unlocked ? 'opacity-50' : ''}`}
          >
            <achievement.icon className="h-4 w-4 mr-2" />
            <div className="flex-1 text-left">
              <div className="font-medium">{achievement.name}</div>
              {!achievement.unlocked && achievement.requirement && (
                <div className="text-xs opacity-75">({achievement.requirement})</div>
              )}
            </div>
          </Badge>
        ))}

        {unlockedCount === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Start learning or creating courses to unlock achievements!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}