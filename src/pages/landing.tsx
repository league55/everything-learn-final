import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { ChevronLeft, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { dbOperations } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface CourseForm {
  topic: string
  context: string
  depth: number
}

const depthLabels = {
  1: "Just exploring the topic",
  2: "Ready to dip my toes",
  3: "I am up for a solid studying session",
  4: "I really want to learn this!",
  5: "I am going to use this professionally"
}

export function LandingPage() {
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

  const steps = [
    {
      id: 1,
      header: "What do you want to learn today?",
      subheader: null,
      field: 'topic' as keyof CourseForm
    },
    {
      id: 2,
      header: "Why do you want to learn it?",
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

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-64 h-64 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-[#323e65] to-[#a7bfd9] rounded-full blob-animation-1" />
        </div>
        
        <div className="absolute bottom-32 right-1/3 w-48 h-48 opacity-15">
          <div className="w-full h-full bg-gradient-to-tl from-[#a7bfd9] to-[#323e65] rounded-full blob-animation-2" />
        </div>
        
        <div className="absolute top-1/2 right-20 w-32 h-32 opacity-25">
          <div className="w-full h-full bg-gradient-to-br from-[#609ae1] to-[#a7bfd9] rounded-full blob-animation-3" />
        </div>
        
        <div className="absolute -top-32 -left-32 w-96 h-96 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-[#323e65] via-[#a7bfd9] to-[#609ae1] rounded-full blob-animation-4" />
        </div>
        
        <div className="absolute bottom-20 left-16 w-20 h-20 opacity-30">
          <div className="w-full h-full bg-gradient-to-tr from-[#609ae1] to-[#a7bfd9] rounded-full blob-animation-5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  step === currentStep 
                    ? "bg-primary scale-125" 
                    : step < currentStep 
                      ? "bg-primary/60" 
                      : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="relative overflow-hidden">
          <div
            className={cn(
              "transition-all duration-300 ease-in-out",
              isTransitioning 
                ? slideDirection === 'right' 
                  ? "-translate-x-full opacity-0" 
                  : "translate-x-full opacity-0"
                : "translate-x-0 opacity-100"
            )}
          >
            {/* Header */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-[#323e65] to-[#a7bfd9] bg-clip-text text-transparent">
                {currentStepData.header}
              </span>
            </h1>

            {/* Subheader */}
            {currentStepData.subheader && (
              <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                {currentStepData.subheader}
              </p>
            )}

            {/* Form Field */}
            <div className="max-w-2xl mx-auto mb-12">
              {currentStep === 1 || currentStep === 2 ? (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#323e65] via-[#a7bfd9] to-[#609ae1] rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity animate-gradient-shift" />
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={currentStep === 1 ? "e.g., React hooks, Machine Learning, Digital Marketing..." : "e.g., I want to build web applications for my startup..."}
                      value={formData[currentStepData.field] as string}
                      onChange={(e) => handleInputChange(currentStepData.field, e.target.value)}
                      className="w-full h-16 px-6 text-lg bg-background border-2 border-border rounded-lg focus:border-primary transition-all duration-300 placeholder:text-muted-foreground/60"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && canProceed() && !isSubmitting) {
                          handleNext()
                        }
                      }}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Depth Label */}
                  <div className="text-2xl font-bold text-white">
                    {depthLabels[formData.depth as keyof typeof depthLabels]}
                  </div>
                  
                  {/* Slider */}
                  <div className="max-w-md mx-auto">
                    <Slider
                      value={[formData.depth]}
                      onValueChange={(value) => handleInputChange('depth', value[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-center items-center space-x-4">
              {currentStep > 1 && (
                <Button 
                  variant="outline"
                  size="lg" 
                  onClick={handleBack}
                  className="px-8 py-4 text-lg"
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
              )}
              
              <Button 
                size="lg" 
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className={cn(
                  "px-12 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl",
                  canProceed() && !isSubmitting
                    ? "bg-gradient-to-r from-[#323e65] to-[#609ae1] hover:from-[#2a3354] hover:to-[#5089d1]"
                    : "bg-muted-foreground/20 cursor-not-allowed hover:scale-100"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Course...
                  </>
                ) : (
                  <>
                    {currentStep === 3 ? 'Generate Course' : 'Continue'}
                    {currentStep < 3 && <ArrowRight className="ml-2 h-5 w-5" />}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob-float-1 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          25% {
            transform: translate(20px, -20px) scale(1.1) rotate(90deg);
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          50% {
            transform: translate(-10px, 20px) scale(0.9) rotate(180deg);
            border-radius: 50% 60% 30% 60% / 40% 50% 60% 30%;
          }
          75% {
            transform: translate(-20px, -10px) scale(1.05) rotate(270deg);
            border-radius: 70% 30% 50% 60% / 30% 40% 60% 50%;
          }
        }

        @keyframes blob-float-2 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
            border-radius: 40% 60% 60% 40% / 60% 30% 60% 40%;
          }
          33% {
            transform: translate(-15px, 25px) scale(1.15) rotate(120deg);
            border-radius: 60% 40% 30% 70% / 40% 60% 50% 30%;
          }
          66% {
            transform: translate(25px, -15px) scale(0.85) rotate(240deg);
            border-radius: 30% 70% 40% 60% / 50% 40% 30% 60%;
          }
        }

        @keyframes blob-float-3 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
            border-radius: 50% 50% 30% 70% / 30% 60% 40% 60%;
          }
          50% {
            transform: translate(30px, 15px) scale(1.2) rotate(180deg);
            border-radius: 70% 30% 60% 40% / 60% 40% 30% 50%;
          }
        }

        @keyframes blob-float-4 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
            border-radius: 60% 40% 40% 60% / 70% 30% 60% 40%;
          }
          20% {
            transform: translate(10px, -25px) scale(0.95) rotate(72deg);
            border-radius: 40% 60% 70% 30% / 40% 60% 30% 70%;
          }
          40% {
            transform: translate(-20px, 10px) scale(1.1) rotate(144deg);
            border-radius: 70% 30% 40% 60% / 30% 70% 60% 40%;
          }
          60% {
            transform: translate(15px, 20px) scale(0.9) rotate(216deg);
            border-radius: 30% 70% 60% 40% / 60% 40% 70% 30%;
          }
          80% {
            transform: translate(-10px, -15px) scale(1.05) rotate(288deg);
            border-radius: 60% 40% 30% 70% / 40% 30% 60% 70%;
          }
        }

        @keyframes blob-float-5 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
            border-radius: 45% 55% 60% 40% / 55% 45% 40% 60%;
          }
          33% {
            transform: translate(20px, -10px) scale(1.3);
            border-radius: 60% 40% 45% 55% / 40% 60% 55% 45%;
          }
          66% {
            transform: translate(-15px, 20px) scale(0.8);
            border-radius: 55% 45% 40% 60% / 60% 40% 45% 55%;
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .blob-animation-1 {
          animation: blob-float-1 20s ease-in-out infinite;
        }

        .blob-animation-2 {
          animation: blob-float-2 25s ease-in-out infinite;
        }

        .blob-animation-3 {
          animation: blob-float-3 15s ease-in-out infinite;
        }

        .blob-animation-4 {
          animation: blob-float-4 30s ease-in-out infinite;
        }

        .blob-animation-5 {
          animation: blob-float-5 18s ease-in-out infinite;
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
      `}</style>
    </div>
  )
}