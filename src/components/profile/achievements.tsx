import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, Target, GraduationCap, BookOpen, Users } from 'lucide-react'
import { dbOperations } from '@/lib/supabase'
import type { CourseWithDetails } from '@/lib/supabase'

interface AchievementsProps {
  // We'll fetch data directly instead of using props
}

export function Achievements({}: AchievementsProps) {
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithDetails[]>([])
  const [createdCourses, setCreatedCourses] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAchievementData = async () => {
      try {
        setLoading(true)
        
        // Load enrolled courses
        const userEnrolledCourses = await dbOperations.getUserEnrolledCourses()
        setEnrolledCourses(userEnrolledCourses)
        
        // Load created courses count
        const userCreatedCourses = await dbOperations.getCourseConfigurations()
        setCreatedCourses(userCreatedCourses.length)
        
      } catch (err) {
        console.error('Failed to load achievement data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAchievementData()
  }, [])

  const hasCompletedCourse = enrolledCourses.some(course => 
    course.user_enrollment?.status === 'completed'
  )
  const hasCreatedCourses = createdCourses >= 5
  const hasEnrolledInCourses = enrolledCourses.length > 0
  const isActiveLearner = enrolledCourses.length >= 3

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
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {createdCourses > 0 && (
          <Badge variant="secondary" className="w-full justify-start">
            <Target className="h-4 w-4 mr-2" />
            First Course Created
          </Badge>
        )}
        
        {hasEnrolledInCourses && (
          <Badge variant="secondary" className="w-full justify-start">
            <Users className="h-4 w-4 mr-2" />
            Learning Journey Started
          </Badge>
        )}
        
        {hasCompletedCourse && (
          <Badge variant="secondary" className="w-full justify-start">
            <GraduationCap className="h-4 w-4 mr-2" />
            Course Completed
          </Badge>
        )}
        
        {isActiveLearner ? (
          <Badge variant="secondary" className="w-full justify-start">
            <BookOpen className="h-4 w-4 mr-2" />
            Active Learner
          </Badge>
        ) : (
          <Badge variant="outline" className="w-full justify-start opacity-50">
            <BookOpen className="h-4 w-4 mr-2" />
            Active Learner (Enroll in 3+ courses)
          </Badge>
        )}
        
        {hasCreatedCourses ? (
          <Badge variant="secondary" className="w-full justify-start">
            <Award className="h-4 w-4 mr-2" />
            Course Creator
          </Badge>
        ) : (
          <Badge variant="outline" className="w-full justify-start opacity-50">
            <Award className="h-4 w-4 mr-2" />
            Course Creator (Create 5+ courses)
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}