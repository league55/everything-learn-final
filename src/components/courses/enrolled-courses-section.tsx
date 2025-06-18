import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/providers/auth-provider'
import { dbOperations } from '@/lib/supabase'
import type { CourseWithDetails } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { authStorage } from '@/lib/auth-storage'
import { 
  GraduationCap,
  Loader2,
  Clock,
  Target,
  Play,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Award,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function EnrolledCoursesSection() {
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const loadEnrolledCourses = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const userCourses = await dbOperations.getUserEnrolledCourses()
        setEnrolledCourses(userCourses)
      } catch (err) {
        console.error('Failed to load enrolled courses:', err)
        setError('Failed to load enrolled courses. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadEnrolledCourses()
  }, [user])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateProgress = (enrollment: any, syllabus: any) => {
    if (!syllabus?.modules || syllabus.modules.length === 0) return 0
    return Math.round((enrollment.current_module_index / syllabus.modules.length) * 100)
  }

  const handleContinueLearning = async (courseId: string) => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    // Store authentication data for cross-domain access
    await authStorage.storeAuthForLibrary(user)
    
    // Redirect to external library
    const libraryUrl = `https://library.everythinglearn.online/courses/${courseId}/learn`
    window.open(libraryUrl, '_blank')
  }

  const handleRetryGeneration = async (courseId: string) => {
    try {
      await dbOperations.retryCourseGeneration(courseId)
      
      toast({
        title: "Generation Retried",
        description: "Course generation has been restarted. Please check back in a few minutes.",
        duration: 5000,
      })

      // Reload courses
      const userCourses = await dbOperations.getUserEnrolledCourses()
      setEnrolledCourses(userCourses)
    } catch (err) {
      console.error('Failed to retry generation:', err)
      toast({
        title: "Retry Failed",
        description: err instanceof Error ? err.message : "Please try again later.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const activeCourses = enrolledCourses.filter(course => 
    course.user_enrollment?.status === 'active'
  )
  
  const completedCourses = enrolledCourses.filter(course => 
    course.user_enrollment?.status === 'completed'
  )

  const generatingCourses = activeCourses.filter(course => 
    course.generation_status === 'generating'
  )

  const readyCourses = activeCourses.filter(course => 
    course.generation_status === 'completed'
  )

  const failedCourses = activeCourses.filter(course => 
    course.generation_status === 'failed'
  )

  // Don't show this section if user is not authenticated
  if (!user) {
    return null
  }

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">My Learning Progress</h2>
            <p className="text-muted-foreground">Continue your learning journey</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading your enrolled courses...</span>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">My Learning Progress</h2>
            <p className="text-muted-foreground">Continue your learning journey</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">My Learning Progress</h2>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>
      </div>

      {enrolledCourses.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
          <CardHeader className="text-center py-8">
            <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl text-muted-foreground">
              No enrolled courses yet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <p className="text-muted-foreground mb-4">
              Start learning by enrolling in a course below or create your own.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Ready ({readyCourses.length})
            </TabsTrigger>
            <TabsTrigger value="generating" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Generating ({generatingCourses.length})
            </TabsTrigger>
            <TabsTrigger value="failed" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Failed ({failedCourses.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Completed ({completedCourses.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-6">
            {readyCourses.length === 0 ? (
              <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
                <CardHeader className="text-center py-8">
                  <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl text-muted-foreground">
                    No ready courses
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <p className="text-muted-foreground mb-4">
                    Your enrolled courses are still being generated. Check the "Generating" tab for progress.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {readyCourses.map((course) => {
                  const progress = course.syllabus ? calculateProgress(course.user_enrollment, course.syllabus) : 0
                  
                  return (
                    <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg line-clamp-2">
                          {course.topic}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getDepthColor(course.depth))}
                          >
                            {getDepthLabel(course.depth)}
                          </Badge>
                          {course.syllabus && (
                            <Badge variant="outline" className="text-xs">
                              {course.syllabus.modules.length} modules
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.context}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Enrolled {formatDate(course.user_enrollment?.enrolled_at || '')}</span>
                          </div>
                        </div>

                        {course.syllabus && (
                          <div className="text-sm text-muted-foreground">
                            Module {(course.user_enrollment?.current_module_index || 0) + 1} of {course.syllabus.modules.length}
                          </div>
                        )}

                        <Button 
                          className="w-full"
                          onClick={() => handleContinueLearning(course.id)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="generating" className="mt-6">
            {generatingCourses.length === 0 ? (
              <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
                <CardHeader className="text-center py-8">
                  <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl text-muted-foreground">
                    No courses generating
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <p className="text-muted-foreground mb-4">
                    All your enrolled courses have finished generating.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Courses Being Generated</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                    These courses are currently being created. You'll be able to start learning once they're complete.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {generatingCourses.map((course) => (
                    <Card key={course.id} className="overflow-hidden border-blue-200 dark:border-blue-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg line-clamp-2">
                          {course.topic}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getDepthColor(course.depth))}
                          >
                            {getDepthLabel(course.depth)}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Generating
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.context}
                        </p>
                        
                        {course.generation_progress !== undefined && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-blue-600 dark:text-blue-400">Generation Progress</span>
                              <span className="text-blue-600 dark:text-blue-400">{course.generation_progress}%</span>
                            </div>
                            <Progress value={course.generation_progress} className="h-2" />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Enrolled {formatDate(course.user_enrollment?.enrolled_at || '')}</span>
                          </div>
                        </div>

                        <Button 
                          variant="outline"
                          className="w-full"
                          disabled
                        >
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Course...
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="failed" className="mt-6">
            {failedCourses.length === 0 ? (
              <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
                <CardHeader className="text-center py-8">
                  <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle className="text-xl text-muted-foreground">
                    No failed generations
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <p className="text-muted-foreground mb-4">
                    All your course generations have been successful!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Failed Course Generations</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    These courses failed to generate. You can retry the generation process.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {failedCourses.map((course) => (
                    <Card key={course.id} className="overflow-hidden border-red-200 dark:border-red-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg line-clamp-2">
                          {course.topic}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getDepthColor(course.depth))}
                          >
                            {getDepthLabel(course.depth)}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.context}
                        </p>
                        
                        {course.generation_error && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                            <p className="text-sm text-red-700 dark:text-red-400">
                              {course.generation_error}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Enrolled {formatDate(course.user_enrollment?.enrolled_at || '')}</span>
                          </div>
                        </div>

                        <Button 
                          variant="outline"
                          className="w-full border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                          onClick={() => handleRetryGeneration(course.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry Generation
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            {completedCourses.length === 0 ? (
              <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
                <CardHeader className="text-center py-8">
                  <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl text-muted-foreground">
                    No completed courses yet
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <p className="text-muted-foreground mb-4">
                    Complete your active courses to see them here for review.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {completedCourses.map((course) => {
                  const completedDate = course.user_enrollment?.completed_at
                  
                  return (
                    <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow border-green-200 dark:border-green-800">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-2 flex-1">
                            {course.topic}
                          </CardTitle>
                          <CheckCircle className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getDepthColor(course.depth))}
                          >
                            {getDepthLabel(course.depth)}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                            Completed
                          </Badge>
                          {course.syllabus && (
                            <Badge variant="outline" className="text-xs">
                              {course.syllabus.modules.length} modules
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.context}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Progress</span>
                            <span className="text-green-600 dark:text-green-400 font-medium">100%</span>
                          </div>
                          <Progress value={100} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            <span>Completed {completedDate ? formatDate(completedDate) : 'Recently'}</span>
                          </div>
                        </div>

                        <Button 
                          variant="outline"
                          className="w-full border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                          onClick={() => handleContinueLearning(course.id)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Review Course
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </section>
  )

  function getDepthColor(depth: number) {
    const colors = {
      1: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      4: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      5: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
    return colors[depth as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
}