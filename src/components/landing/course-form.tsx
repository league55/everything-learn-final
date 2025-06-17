import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StepIndicator } from './step-indicator'
import { FormHeader } from './form-header'
import { TextInputField } from './text-input-field'
import { DepthSelector } from './depth-selector'
import { NavigationButtons } from './navigation-buttons'
import { TopicCarousel } from './topic-carousel'
import { ContextCarousel } from './context-carousel'
import { dbOperations } from '@/lib/supabase'
import { courseStorage } from '@/lib/course-storage'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'

interface CourseForm {
  topic: string
  context: string
  depth: number
}

const steps = [
  {
    id: 1,
    header: "What do you want to learn today?",
    subheader: "We recommend to create courses with narrow scope, you can always generate more ;)",
    field: 'topic' as keyof CourseForm
  },
  {
    id: 2,
    header: "Why do you want to learn?",
    subheader: "Give us some context about how you would apply this knowledge, so we could adjust the course to your needs",
    field: 'context' as keyof CourseForm
  },
  {
    id: 3,
    header: "How deep would you like to dive into the topic?",
    subheader: null,
    field: 'depth' as keyof CourseForm
  }
]

export function CourseForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
  const [formData, setFormData] = useState<CourseForm>({
    topic: '',
    context: '',
    depth: 3
  })
  
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const currentStepData = steps[currentStep - 1]

  const handleSubmitCourse = async (courseData: CourseForm, userId: string) => {
    try {
      // Create course configuration
      const courseConfig = await dbOperations.createCourseConfiguration({
        topic: courseData.topic.trim(),
        context: courseData.context.trim(),
        depth: courseData.depth,
        user_id: userId
      })

      // Create initial syllabus record and enqueue generation job
      await dbOperations.createSyllabus(courseConfig.id)

      // Automatically enroll the course creator
      try {
        await dbOperations.enrollInCourse(courseConfig.id, userId)
        console.log('Course creator automatically enrolled in course:', courseConfig.id)
      } catch (enrollError) {
        console.warn('Failed to auto-enroll course creator, but course was created successfully:', enrollError)
        // Don't throw error - course creation was successful
      }

      // Clear any pending course data
      courseStorage.clearPendingCourse()

      toast({
        title: "Course Created & Enrolled!",
        description: `Your course "${courseData.topic}" is being generated. You're automatically enrolled and can track progress.`,
        duration: 5000,
      })

      // Navigate to courses page to show progress
      navigate('/courses')

    } catch (error) {
      console.error('Failed to submit course:', error)
      toast({
        title: "Failed to Create Course",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
        duration: 5000,
      })
      throw error
    }
  }

  const handleSubmitForm = async () => {
    setIsSubmitting(true)
    
    try {
      if (!user) {
        // Store course data for after authentication
        courseStorage.storePendingCourse(formData)
        
        toast({
          title: "Sign in to Generate Course",
          description: "Your course configuration has been saved. Please sign in to generate it.",
          duration: 5000,
        })

        // Navigate to login
        navigate('/login')
        return
      }

      // User is authenticated, submit course immediately
      await handleSubmitCourse(formData, user.id)

      // Reset form
      setFormData({
        topic: '',
        context: '',
        depth: 3
      })
      setCurrentStep(1)

    } catch (error) {
      // Error handling is done in handleSubmitCourse
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setIsTransitioning(true)
      setSlideDirection('right')
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsTransitioning(false)
      }, 300)
    } else {
      handleSubmitForm()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setIsTransitioning(true)
      setSlideDirection('left')
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsTransitioning(false)
      }, 300)
    }
  }

  const handleInputChange = (field: keyof CourseForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTopicSelect = (topic: string) => {
    if (currentStep === 1) {
      handleInputChange('topic', topic)
    }
  }

  const handleContextSelect = (context: string) => {
    if (currentStep === 2) {
      handleInputChange('context', context)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.topic.trim().length > 0
      case 2:
        return formData.context.trim().length > 0
      case 3:
        return true
      default:
        return false
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceed() && !isSubmitting) {
      handleNext()
    }
  }

  return (
    <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} totalSteps={3} />

      {/* Form Container */}
      <div className="relative overflow-hidden">
        <FormHeader 
          header={currentStepData.header}
          subheader={currentStepData.subheader}
          isTransitioning={isTransitioning}
          slideDirection={slideDirection}
        />

        {/* Form Field */}
        {!isTransitioning && (
          <>
            {currentStep === 1 || currentStep === 2 ? (
              <TextInputField
                value={formData[currentStepData.field] as string}
                onChange={(value) => handleInputChange(currentStepData.field, value)}
                placeholder={
                  currentStep === 1 
                    ? "e.g., React hooks, Machine Learning, Digital Marketing..." 
                    : "e.g., I want to build web applications for my startup..."
                }
                onKeyPress={handleKeyPress}
                disabled={isSubmitting}
              />
            ) : (
              <DepthSelector
                value={formData.depth}
                onChange={(value) => handleInputChange('depth', value)}
                disabled={isSubmitting}
              />
            )}

            {/* Topic Carousel - Only show on step 1 */}
            {currentStep === 1 && (
              <TopicCarousel 
                onTopicSelect={handleTopicSelect}
                isActive={currentStep === 1}
              />
            )}

            {/* Context Carousel - Only show on step 2 */}
            {currentStep === 2 && (
              <ContextCarousel 
                onContextSelect={handleContextSelect}
                isActive={currentStep === 2}
              />
            )}

            {/* Navigation */}
            <NavigationButtons
              currentStep={currentStep}
              totalSteps={3}
              canProceed={canProceed()}
              isSubmitting={isSubmitting}
              isAuthenticated={!!user}
              onBack={handleBack}
              onNext={handleNext}
            />
          </>
        )}
      </div>
    </div>
  )
}