import { AnimatedBackground } from '@/components/landing/animated-background'
import { CourseForm } from '@/components/landing/course-form'

export function LandingPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <AnimatedBackground />
      <CourseForm />
    </div>
  )
}