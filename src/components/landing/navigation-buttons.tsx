import { Button } from '@/components/ui/button'
import { ChevronLeft, ArrowRight, Loader2, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationButtonsProps {
  currentStep: number
  totalSteps: number
  canProceed: boolean
  isSubmitting: boolean
  isAuthenticated: boolean
  onBack: () => void
  onNext: () => void
}

export function NavigationButtons({ 
  currentStep, 
  totalSteps, 
  canProceed, 
  isSubmitting, 
  isAuthenticated,
  onBack, 
  onNext 
}: NavigationButtonsProps) {
  const isLastStep = currentStep === totalSteps
  const needsAuth = isLastStep && !isAuthenticated

  return (
    <div className="flex justify-center items-center space-x-4">
      {currentStep > 1 && (
        <Button 
          variant="outline"
          size="lg" 
          onClick={onBack}
          className="px-8 py-4 text-lg"
          disabled={isSubmitting}
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
      )}
      
      <Button 
        size="lg" 
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        className={cn(
          "px-12 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl",
          canProceed && !isSubmitting
            ? "bg-gradient-to-r from-[#323e65] to-[#609ae1] hover:from-[#2a3354] hover:to-[#5089d1]"
            : "bg-muted-foreground/20 cursor-not-allowed hover:scale-100"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {needsAuth ? 'Saving...' : 'Creating Course...'}
          </>
        ) : (
          <>
            {needsAuth ? (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Sign In & Generate
              </>
            ) : isLastStep ? (
              'Generate Course'
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </>
        )}
      </Button>
    </div>
  )
}