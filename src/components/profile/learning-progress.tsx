import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BookOpen, TrendingUp, Target, Award } from 'lucide-react'
import { enrollmentDb, courseDb } from '@/lib/supabase/db'
import { useAuth } from '@/providers/auth-provider'
import type { CourseWithDetails, CourseConfiguration } from '@/lib/supabase/types'

export function LearningProgress() {
  const { user } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithDetails[]>([])
  const [createdCourses, setCreatedCourses] = useState<CourseConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProgressData = async () => {
      if (!user) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Load enrolled courses for progress tracking
        const userEnrolledCourses = await enrollmentDb.getUserEnrolledCourses()
        setEnrolledCourses(userEnrolledCourses)
        
        // Load created courses (should already be filtered by user_id in the database function)
        const userCreatedCourses = await courseDb.getCourseConfigurations()
        setCreatedCourses(userCreatedCourses)
        
        console.log('User ID:', user.id)
        console.log('Created courses:', userCreatedCourses)
        console.log('Created courses count:', userCreatedCourses.length)
        
      } catch (err) {
        console.error('Failed to load progress data:', err)
        setError('Failed to load learning progress data')
      } finally {
        setLoading(false)
      }
    }

    loadProgressData()
  }, [user])

  const completedCourses = enrolledCourses.filter(course => 
    course.user_enrollment?.status === 'completed'
  ).length

  const activeCourses = enrolledCourses.filter(course => 
    course.user_enrollment?.status === 'active'
  ).length

  // Calculate average progress across all enrolled courses
  const averageProgress = enrolledCourses.length > 0 
    ? enrolledCourses.reduce((acc, course) => {
        if (!course.syllabus?.modules || course.syllabus.modules.length === 0) return acc
        const progress = (course.user_enrollment?.current_module_index || 0) / course.syllabus.modules.length
        return acc + progress
      }, 0) / enrolledCourses.length * 100
    : 0

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
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
            <TrendingUp className="h-5 w-5" />
            Learning Progress
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Enrolled Courses
            </span>
            <span className="font-medium">{enrolledCourses.length}</span>
          </div>
          <Progress 
            value={Math.min(enrolledCourses.length * 25, 100)} 
            className="h-2" 
          />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              Completed Courses
            </span>
            <span className="font-medium">{completedCourses}/{enrolledCourses.length}</span>
          </div>
          <Progress 
            value={enrolledCourses.length > 0 ? (completedCourses / enrolledCourses.length) * 100 : 0} 
            className="h-2" 
          />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Active Learning
            </span>
            <span className="font-medium">{activeCourses} active</span>
          </div>
          <Progress 
            value={enrolledCourses.length > 0 ? (activeCourses / enrolledCourses.length) * 100 : 0} 
            className="h-2" 
          />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Average Progress</span>
            <span className="font-medium">{Math.round(averageProgress)}%</span>
          </div>
          <Progress value={averageProgress} className="h-2" />
        </div>

        {/* Summary stats */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{createdCourses.length}</p>
              <p className="text-xs text-muted-foreground">Courses Created</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{enrolledCourses.length}</p>
              <p className="text-xs text-muted-foreground">Learning Paths</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}