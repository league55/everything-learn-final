import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BookOpen } from 'lucide-react'
import type { CourseConfiguration, Syllabus } from '@/lib/supabase'

interface LearningProgressProps {
  courses: CourseConfiguration[]
  syllabi: Record<string, Syllabus>
}

export function LearningProgress({ courses, syllabi }: LearningProgressProps) {
  const completedCourses = Object.values(syllabi).filter(s => s.status === 'completed').length
  const activeCourses = Object.values(syllabi).filter(s => s.status === 'generating' || s.status === 'pending').length

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
            <span>{courses.length}</span>
          </div>
          <Progress value={Math.min(courses.length * 20, 100)} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Completed Courses</span>
            <span>{completedCourses}/{courses.length}</span>
          </div>
          <Progress 
            value={courses.length > 0 ? (completedCourses / courses.length) * 100 : 0} 
            className="h-2" 
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Active Courses</span>
            <span>{activeCourses}</span>
          </div>
          <Progress 
            value={courses.length > 0 ? (activeCourses / courses.length) * 100 : 0} 
            className="h-2" 
          />
        </div>
      </CardContent>
    </Card>
  )
}