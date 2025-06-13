import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex space-x-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1
          return (
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
          )
        })}
      </div>
    </div>
  )
}