import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Target, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CourseConfiguration, Syllabus } from '@/lib/supabase'

interface CourseListProps {
  courses: CourseConfiguration[]
  syllabi: Record<string, Syllabus>
}

export function CourseList({ courses, syllabi }: CourseListProps) {
  const getDepthLabel = (depth: number) => {
    const labels = {
      1: 'Beginner',
      2: 'Casual',
      3: 'Hobby',
      4: 'Academic',
      5: 'Professional'
    }
    return labels[depth as keyof typeof labels] || 'Unknown'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'generating':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (courses.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
        <CardHeader className="text-center py-12">
          <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl text-muted-foreground">
            No courses yet
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-12">
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Start your learning journey by creating your first course.
          </p>
          <Button asChild>
            <a href="/">Create Your First Course</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        const syllabus = syllabi[course.id]
        return (
          <Card key={course.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">
                  {course.topic}
                </CardTitle>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "ml-2 flex-shrink-0",
                    syllabus && getStatusColor(syllabus.status)
                  )}
                >
                  {syllabus?.status || 'unknown'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {course.context}
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{getDepthLabel(course.depth)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(course.created_at)}</span>
                </div>
              </div>
              {syllabus && syllabus.modules && syllabus.modules.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{syllabus.modules.length}</span> modules
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}