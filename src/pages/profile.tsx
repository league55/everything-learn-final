import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/providers/auth-provider'
import { dbOperations } from '@/lib/supabase'
import type { CourseConfiguration, Syllabus } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  BookOpen, 
  Target, 
  Settings,
  Clock,
  GraduationCap,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [courses, setCourses] = useState<CourseConfiguration[]>([])
  const [syllabi, setSyllabi] = useState<Record<string, Syllabus>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // Load courses
        const userCourses = await dbOperations.getCourseConfigurations()
        setCourses(userCourses)

        // Load syllabi for each course
        const syllabusData: Record<string, Syllabus> = {}
        for (const course of userCourses) {
          try {
            const syllabus = await dbOperations.getSyllabus(course.id)
            if (syllabus) {
              syllabusData[course.id] = syllabus
            }
          } catch (err) {
            console.warn(`Failed to load syllabus for course ${course.id}:`, err)
          }
        }
        setSyllabi(syllabusData)

      } catch (err) {
        console.error('Failed to load user data:', err)
        setError('Failed to load your data. Please try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user])

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your profile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Profile</h1>
          <p className="text-xl text-muted-foreground">
            Manage your learning journey and track your progress.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-lg">
                        {user?.email ? getInitials(user.email) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user?.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {user?.created_at ? formatDate(user.created_at) : 'Recently'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Progress */}
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
                      <span>
                        {Object.values(syllabi).filter(s => s.status === 'completed').length}/
                        {courses.length}
                      </span>
                    </div>
                    <Progress 
                      value={courses.length > 0 ? (Object.values(syllabi).filter(s => s.status === 'completed').length / courses.length) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Active Courses</span>
                      <span>
                        {Object.values(syllabi).filter(s => s.status === 'generating' || s.status === 'pending').length}
                      </span>
                    </div>
                    <Progress 
                      value={courses.length > 0 ? (Object.values(syllabi).filter(s => s.status === 'generating' || s.status === 'pending').length / courses.length) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {courses.length > 0 && (
                    <Badge variant="secondary" className="w-full justify-start">
                      <Target className="h-4 w-4 mr-2" />
                      First Course Created
                    </Badge>
                  )}
                  {Object.values(syllabi).some(s => s.status === 'completed') && (
                    <Badge variant="secondary" className="w-full justify-start">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Course Completed
                    </Badge>
                  )}
                  {courses.length >= 5 ? (
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
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <Button asChild>
                <a href="/">Create New Course</a>
              </Button>
            </div>

            {courses.length === 0 ? (
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
            ) : (
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
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if you need to update it.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-id">User ID</Label>
                    <Input
                      id="user-id"
                      value={user?.id || ''}
                      disabled
                      className="bg-muted font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your unique user identifier.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
                  <Alert>
                    <AlertDescription>
                      Account deletion is not currently available through the interface. 
                      Contact support if you need to delete your account.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}