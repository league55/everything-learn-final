import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, Target, GraduationCap, BookOpen } from 'lucide-react'
import type { CourseConfiguration, Syllabus } from '@/lib/supabase'

interface AchievementsProps {
  courses: CourseConfiguration[]
  syllabi: Record<string, Syllabus>
}

export function Achievements({ courses, syllabi }: AchievementsProps) {
  const hasCompletedCourse = Object.values(syllabi).some(s => s.status === 'completed')
  const hasCreatedCourses = courses.length >= 5

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {courses.length > 0 && (
          <Badge variant="secondary\" className="w-full justify-start">
            <Target className="h-4 w-4 mr-2" />
            First Course Created
          </Badge>
        )}
        {hasCompletedCourse && (
          <Badge variant="secondary" className="w-full justify-start">
            <GraduationCap className="h-4 w-4 mr-2" />
            Course Completed
          </Badge>
        )}
        {hasCreatedCourses ? (
          <Badge variant="secondary" className="w-full justify-start">
            <BookOpen className="h-4 w-4 mr-2" />
            Course Creator
          </Badge>
        ) : (
          <Badge variant="outline" className="w-full justify-start opacity-50">
            <BookOpen className="h-4 w-4 mr-2" />
            Course Creator (Locked)
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}