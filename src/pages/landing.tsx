import { AnimatedBackground } from '@/components/landing/animated-background'
import { CourseForm } from '@/components/landing/course-form' 
import { Roadmap } from '@/components/landing/roadmap'
import { ShootingStars } from '@/components/landing/shoting-stars'

export function LandingPage() {
  return (
    <div className="relative">
      {/* Hero Section - Base layer */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background z-10">
        <ShootingStars
          starColor="#9E00FF"
          trailColor="#2EB9DF"
          minSpeed={15}
          maxSpeed={35}
          minDelay={1000}
          maxDelay={3000}
        />
        <ShootingStars
          starColor="#FF0099"
          trailColor="#FFB800"
          minSpeed={10}
          maxSpeed={25}
          minDelay={2000}
          maxDelay={4000}
        />
        <ShootingStars
          starColor="#00FF9E"
          trailColor="#00B8FF"
          minSpeed={20}
          maxSpeed={40}
          minDelay={1500}
          maxDelay={3500}
        /> 
        <AnimatedBackground />
        <CourseForm />
      </section>

      {/* Roadmap Section - Overlay layer */}
      <section className="scroll-overlay-section relative z-20">
        <Roadmap />
      </section>
    </div>
  )
}