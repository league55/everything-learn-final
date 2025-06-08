import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BookOpen } from 'lucide-react'
import { dbOperations } from '@/lib/supabase'
import type { CourseWithDetails } from '@/lib/supabase'

interface LearningProgressProps {
  // We'll fetch enrolled courses directly instead of using props
}

export function LearningProgress({}: LearningProgressProps) {
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithDetails[]>([])
  const [createdCourses, setCreatedCourses] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        setLoading(true)
        
        // Load enrolled courses for progress tracking
        const userEnrolledCourses = await dbOperations.getUserEnrolledCourses()
        setEnrolledCourses(userEnrolledCourses)
        
        // Load created courses count
        const userCreatedCourses = await dbOperations.getCourseConfigurations()
        setCreatedCourses(userCreatedCourses.length)
        
      } catch (err) {
        console.error('Failed to load progress data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProgressData()
  }, [])

  const completedCourses = enrolledCourses.filter(course => 
    course.user_enrollment?.status === 'completed'
  ).length

  const activeCourses = enrolledCourses.filter(course => 
    course.user_enrollment?.status === 'active'
  ).length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Courses Created</span>
            <span>{createdCourses}</span>
          </div>
          <Progress value={Math.min(createdCourses * 20, 100)} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Enrolled Courses</span>
            <span>{enrolledCourses.length}</span>
          </div>
          <Progress 
            value={Math.min(enrolledCourses.length * 25, 100)} 
            className="h-2" 
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Completed Courses</span>
            <span>{completedCourses}/{enrolledCourses.length}</span>
          </div>
          <Progress 
            value={enrolledCourses.length > 0 ? (completedCourses / enrolledCourses.length) * 100 : 0} 
            className="h-2" 
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Active Courses</span>
            <span>{activeCourses}</span>
          </div>
          <Progress 
            value={enrolledCourses.length > 0 ? (activeCourses / enrolledCourses.length) * 100 : 0} 
            className="h-2" 
          />
        </div>
      </CardContent>
    </Card>
  )
}