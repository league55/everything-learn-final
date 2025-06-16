import { useState } from 'react'
import { StepIndicator } from './step-indicator'
import { FormHeader } from './form-header'
import { TextInputField } from './text-input-field'
import { DepthSelector } from './depth-selector'
import { NavigationButtons } from './navigation-buttons'
import { TopicCarousel } from './topic-carousel'
import { ContextCarousel } from './context-carousel'
import { dbOperations } from '@/lib/supabase'
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
  
  const { toast } = useToast()

  const currentStepData = steps[currentStep - 1]

  const handleSubmitForm = async () => {
    setIsSubmitting(true)
    
    try {
      // Create course configuration
      const courseConfig = await dbOperations.createCourseConfiguration({
        topic: formData.topic.trim(),
        context: formData.context.trim(),
        depth: formData.depth
      })

      // Create initial syllabus record and enqueue generation job
      const { syllabus, job } = await dbOperations.createSyllabus(courseConfig.id)

      toast({
        title: "Course Created Successfully!",
        description: `Your course "${formData.topic}" is being generated. You can track its progress in the courses page.`,
        duration: 5000,
      })

      // Reset form
      setFormData({
        topic: '',
        context: '',
        depth: 3
      })
      setCurrentStep(1)

    } catch (error) {
      console.error('Failed to submit course:', error)
      toast({
        title: "Failed to Create Course",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
        duration: 5000,
      })
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
              onBack={handleBack}
              onNext={handleNext}
            />
          </>
        )}
      </div>
    </div>
  )
}