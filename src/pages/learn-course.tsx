import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/auth-provider'
import { dbOperations } from '@/lib/supabase'
import type { CourseConfiguration, Syllabus, UserEnrollment } from '@/lib/supabase'
import { CourseSidebar } from '@/components/course/course-sidebar'
import { CourseContent } from '@/components/course/course-content'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2, Search, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CourseData {
  configuration: CourseConfiguration
  syllabus: Syllabus
  enrollment: UserEnrollment
}

export function LearnCoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0)
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId || !user) return

      try {
        setLoading(true)
        
        // Load course configuration
        const courses = await dbOperations.getCourseConfigurations()
        const configuration = courses.find(c => c.id === courseId)
        
        if (!configuration) {
          throw new Error('Course not found')
        }

        // Load syllabus
        const syllabus = await dbOperations.getSyllabus(courseId)
        
        if (!syllabus || syllabus.status !== 'completed') {
          throw new Error('Course syllabus is not ready')
        }

        // Load user enrollment
        const enrolledCourses = await dbOperations.getUserEnrolledCourses()
        const enrollment = enrolledCourses.find(ec => ec.id === courseId)?.user_enrollment
        
        if (!enrollment) {
          throw new Error('You are not enrolled in this course')
        }

        setCourseData({
          configuration,
          syllabus,
          enrollment
        })

        // Set initial position based on enrollment progress
        setSelectedModuleIndex(enrollment.current_module_index || 0)
        setSelectedTopicIndex(0)

      } catch (err) {
        console.error('Failed to load course data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    loadCourseData()
  }, [courseId, user])

  const handleTopicSelect = async (moduleIndex: number, topicIndex: number) => {
    setSelectedModuleIndex(moduleIndex)
    setSelectedTopicIndex(topicIndex)

    // Update progress if user has advanced
    if (courseData?.enrollment && moduleIndex > courseData.enrollment.current_module_index) {
      try {
        await dbOperations.updateCourseProgress(
          courseData.enrollment.id,
          moduleIndex
        )
        
        // Update local state
        setCourseData(prev => prev ? {
          ...prev,
          enrollment: {
            ...prev.enrollment,
            current_module_index: moduleIndex
          }
        } : null)

        toast({
          title: "Progress Updated",
          description: `Advanced to module ${moduleIndex + 1}`,
          duration: 2000,
        })
      } catch (err) {
        console.error('Failed to update progress:', err)
      }
    }
  }

  const handleMarkComplete = async () => {
    if (!courseData) return

    try {
      const totalModules = courseData.syllabus.modules.length
      const isLastModule = selectedModuleIndex === totalModules - 1

      await dbOperations.updateCourseProgress(
        courseData.enrollment.id,
        isLastModule ? selectedModuleIndex : selectedModuleIndex + 1,
        isLastModule
      )

      if (isLastModule) {
        toast({
          title: "Congratulations!",
          description: "You have completed the course!",
          duration: 5000,
        })
        navigate('/courses')
      } else {
        setSelectedModuleIndex(selectedModuleIndex + 1)
        setSelectedTopicIndex(0)
        
        toast({
          title: "Module Completed!",
          description: "Moving to the next module",
          duration: 3000,
        })
      }
    } catch (err) {
      console.error('Failed to mark complete:', err)
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
        duration: 3000,
      })
    }
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

  if (error || !courseData) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Course data not available'}</AlertDescription>
          </Alert>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/courses')}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  const currentModule = courseData.syllabus.modules[selectedModuleIndex]
  const currentTopic = currentModule?.topics[selectedTopicIndex]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "transition-all duration-300 border-r border-border",
        sidebarCollapsed ? "w-0" : "w-80"
      )}>
        <div className="h-full overflow-hidden">
          <CourseSidebar
            course={courseData.configuration}
            syllabus={courseData.syllabus}
            enrollment={courseData.enrollment}
            selectedModuleIndex={selectedModuleIndex}
            selectedTopicIndex={selectedTopicIndex}
            onTopicSelect={handleTopicSelect}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            collapsed={sidebarCollapsed}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-border p-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/courses')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <CourseContent
            course={courseData.configuration}
            module={currentModule}
            topic={currentTopic}
            moduleIndex={selectedModuleIndex}
            topicIndex={selectedTopicIndex}
            totalModules={courseData.syllabus.modules.length}
            enrollment={courseData.enrollment}
            onMarkComplete={handleMarkComplete}
            onNavigate={handleTopicSelect}
          />
        </div>
      </div>
    </div>
  )
}