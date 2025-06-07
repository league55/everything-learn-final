import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/providers/auth-provider'
import { dbOperations } from '@/lib/supabase'
import type { CourseWithDetails } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Target, 
  Play,
  GraduationCap,
  Loader2,
  User,
  TrendingUp,
  CheckCircle,
  BookmarkPlus,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function CoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithDetails[]>([])
  const [allCourses, setAllCourses] = useState<CourseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true)
        
        // Load all public courses
        const publicCourses = await dbOperations.getAllCourses()
        setAllCourses(publicCourses)

        // Load enrolled courses if user is authenticated
        if (user) {
          const userCourses = await dbOperations.getUserEnrolledCourses()
          setEnrolledCourses(userCourses)
        }

      } catch (err) {
        console.error('Failed to load courses:', err)
        setError('Failed to load courses. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadCourses()
    }
  }, [user, authLoading])

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      navigate('/login')
      return
    }

    setEnrolling(courseId)
    try {
      await dbOperations.enrollInCourse(courseId)
      
      toast({
        title: "Successfully Enrolled!",
        description: "You can now start learning this course.",
        duration: 3000,
      })

      // Refresh enrolled courses
      const userCourses = await dbOperations.getUserEnrolledCourses()
      setEnrolledCourses(userCourses)

      // Update all courses to reflect enrollment
      const publicCourses = await dbOperations.getAllCourses()
      setAllCourses(publicCourses)

    } catch (err) {
      console.error('Failed to enroll:', err)
      toast({
        title: "Enrollment Failed",
        description: err instanceof Error ? err.message : "Please try again later.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setEnrolling(null)
    }
  }

  const handleContinueLearning = (courseId: string) => {
    navigate(`/learn/${courseId}`)
  }

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

  const getDepthColor = (depth: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      4: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      5: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
    return colors[depth as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading courses...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Course Library</h1>
          <p className="text-xl text-muted-foreground">
            Discover AI-powered courses and track your learning progress.
          </p>
        </div>

        {/* Enrolled Courses Section - Only show for authenticated users */}
        {user && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">My Learning Progress</h2>
                <p className="text-muted-foreground">Continue your learning journey</p>
              </div>
              <Button asChild variant="outline">
                <a href="/">
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Create Course
                </a>
              </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => {
                  const progress = course.syllabus ? calculateProgress(course.user_enrollment, course.syllabus) : 0
                  const isCompleted = course.user_enrollment?.status === 'completed'
                  
                  return (
                    <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-2 flex-1">
                            {course.topic}
                          </CardTitle>
                          {isCompleted && (
                            <CheckCircle className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />
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
                            <Target className="h-4 w-4" />
                            <span>{getDepthLabel(course.depth)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Enrolled {formatDate(course.user_enrollment?.enrolled_at || '')}</span>
                          </div>
                        </div>

                        {course.syllabus && (
                          <div className="text-sm text-muted-foreground">
                            Module {course.user_enrollment?.current_module_index || 0 + 1} of {course.syllabus.modules.length}
                          </div>
                        )}

                        <Button 
                          className="w-full" 
                          variant={isCompleted ? "outline" : "default"}
                          onClick={() => handleContinueLearning(course.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {isCompleted ? 'Review Course' : 'Continue Learning'}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* All Courses Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {user ? 'Discover More Courses' : 'Available Courses'}
              </h2>
              <p className="text-muted-foreground">
                Explore courses created by our community of learners
              </p>
            </div>
          </div>

          {allCourses.length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
              <CardHeader className="text-center py-12">
                <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl text-muted-foreground">
                  No courses available yet
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-12">
                <p className="text-muted-foreground max-w-md mx-auto">
                  Be the first to create a course! Our AI will generate comprehensive learning materials for any topic.
                </p>
                <Button asChild className="mt-4">
                  <a href="/">Create the First Course</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCourses.map((course) => {
                const isEnrolled = course.user_enrollment !== undefined
                const isEnrolling = enrolling === course.id
                
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
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {course.context}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.enrollment_count || 0} enrolled</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>By community</span>
                        </div>
                      </div>

                      {course.syllabus?.keywords && course.syllabus.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {course.syllabus.keywords.slice(0, 3).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {course.syllabus.keywords.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{course.syllabus.keywords.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {isEnrolled ? (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleContinueLearning(course.id)}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Button>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => handleEnroll(course.id)}
                          disabled={isEnrolling}
                        >
                          {isEnrolling ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enrolling...
                            </>
                          ) : (
                            <>
                              <BookOpen className="h-4 w-4 mr-2" />
                              {user ? 'Enroll Now' : 'Sign In to Enroll'}
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}