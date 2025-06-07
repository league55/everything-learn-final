import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/providers/auth-provider'
import { dbOperations } from '@/lib/supabase'
import type { CourseWithDetails, SyllabusModule, SyllabusTopic } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { CourseNavigation } from '@/components/course/course-navigation'
import { CourseContent } from '@/components/course/course-content'
import { CourseBreadcrumb } from '@/components/course/course-breadcrumb'
import { 
  ArrowLeft,
  Search,
  Settings,
  BookOpen,
  Loader2,
  Home,
  Moon,
  Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/providers/theme-provider'

interface CourseProgress {
  moduleIndex: number
  topicIndex: number
  completedTopics: Set<string>
}

export function CourseLearnPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [course, setCourse] = useState<CourseWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [progress, setProgress] = useState<CourseProgress>({
    moduleIndex: 0,
    topicIndex: 0,
    completedTopics: new Set()
  })
  
  const [selectedModule, setSelectedModule] = useState<number>(0)
  const [selectedTopic, setSelectedTopic] = useState<number>(0)

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId || !user) return

      try {
        setLoading(true)
        
        // Get course with enrollment info
        const enrolledCourses = await dbOperations.getUserEnrolledCourses()
        const enrolledCourse = enrolledCourses.find(c => c.id === courseId)
        
        if (!enrolledCourse) {
          // If not enrolled, try to get course info from public courses
          const publicCourses = await dbOperations.getAllCourses()
          const publicCourse = publicCourses.find(c => c.id === courseId)
          
          if (!publicCourse) {
            throw new Error('Course not found')
          }
          
          // Redirect to courses page with enrollment message
          toast({
            title: "Not Enrolled",
            description: "You need to enroll in this course first.",
            variant: "destructive"
          })
          navigate('/courses')
          return
        }

        setCourse(enrolledCourse)
        
        // Set initial progress from enrollment
        if (enrolledCourse.user_enrollment) {
          const moduleIndex = enrolledCourse.user_enrollment.current_module_index || 0
          setProgress(prev => ({
            ...prev,
            moduleIndex,
            topicIndex: 0
          }))
          setSelectedModule(moduleIndex)
          setSelectedTopic(0)
        }

      } catch (err) {
        console.error('Failed to load course:', err)
        setError(err instanceof Error ? err.message : 'Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [courseId, user, navigate, toast])

  const handleTopicSelect = async (moduleIndex: number, topicIndex: number) => {
    setSelectedModule(moduleIndex)
    setSelectedTopic(topicIndex)
    
    // Update progress in database if this is further than current progress
    if (course?.user_enrollment && moduleIndex >= progress.moduleIndex) {
      try {
        await dbOperations.updateCourseProgress(
          course.user_enrollment.id,
          moduleIndex,
          false
        )
        
        setProgress(prev => ({
          ...prev,
          moduleIndex,
          topicIndex
        }))
      } catch (err) {
        console.error('Failed to update progress:', err)
      }
    }
  }

  const handleTopicComplete = (moduleIndex: number, topicIndex: number) => {
    const topicKey = `${moduleIndex}-${topicIndex}`
    setProgress(prev => ({
      ...prev,
      completedTopics: new Set([...prev.completedTopics, topicKey])
    }))
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const getCurrentTopic = (): SyllabusTopic | null => {
    if (!course?.syllabus?.modules) return null
    const module = course.syllabus.modules[selectedModule]
    if (!module || !module.topics) return null
    return module.topics[selectedTopic] || null
  }

  const getTotalTopics = (): number => {
    if (!course?.syllabus?.modules) return 0
    return course.syllabus.modules.reduce((total, module) => total + (module.topics?.length || 0), 0)
  }

  const getCompletedTopicsCount = (): number => {
    return progress.completedTopics.size
  }

  const getProgressPercentage = (): number => {
    const total = getTotalTopics()
    const completed = getCompletedTopicsCount()
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading course...</span>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Course not found'}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/courses')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "border-r border-border bg-card transition-all duration-300",
        sidebarCollapsed ? "w-0 overflow-hidden" : "w-80"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/courses')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(true)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <h1 className="text-lg font-semibold mb-2 line-clamp-2">
              {course.topic}
            </h1>
            
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {getCompletedTopicsCount()} of {getTotalTopics()} topics completed
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1">
            <CourseNavigation
              modules={course.syllabus?.modules || []}
              selectedModule={selectedModule}
              selectedTopic={selectedTopic}
              onTopicSelect={handleTopicSelect}
              completedTopics={progress.completedTopics}
              searchQuery={searchQuery}
            />
          </ScrollArea>

          {/* Settings */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Settings</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                >
                  {theme === 'light' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            {sidebarCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(false)}
              >
                <BookOpen className="h-4 w-4" />
              </Button>
            )}
            
            <CourseBreadcrumb
              courseTopic={course.topic}
              modules={course.syllabus?.modules || []}
              selectedModule={selectedModule}
              selectedTopic={selectedTopic}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <CourseContent
            topic={getCurrentTopic()}
            moduleIndex={selectedModule}
            topicIndex={selectedTopic}
            onTopicComplete={handleTopicComplete}
            isCompleted={progress.completedTopics.has(`${selectedModule}-${selectedTopic}`)}
          />
        </div>
      </div>
    </div>
  )
}