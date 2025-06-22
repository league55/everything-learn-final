import { AnimatedBackground } from '@/components/landing/animated-background'
import { CourseForm } from '@/components/landing/course-form' 
import { OriginStorySection } from '@/components/landing/origin-story-section'
import { Roadmap } from '@/components/landing/roadmap'
import { ShootingStars } from '@/components/landing/shoting-stars'
import { BoltBadge } from '@/components/landing/bolt-badge'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useRef } from 'react'

export function LandingPage() {
  const roadmapRef = useRef<HTMLElement>(null)

  return (
    <div className="relative">
      {/* Bolt Badge */}
      <BoltBadge />

      {/* Hero Section */}
      <div id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
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
        
        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 transform -translate-x-1/2 z-10 flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <motion.div
            className="flex flex-col items-center gap-2 text-muted-foreground cursor-pointer group text-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            onClick={() => {
              const originSection = document.getElementById('origin-section')
              originSection?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <span className="text-sm font-medium group-hover:text-foreground transition-colors">
              Learn our story
            </span>
            <motion.div
              className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center group-hover:border-foreground/50 transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                className="w-1 h-3 bg-muted-foreground rounded-full mt-2 group-hover:bg-foreground transition-colors"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            <ChevronDown className="h-4 w-4 group-hover:text-foreground transition-colors" />
          </motion.div>
        </motion.div>
      </div>

      {/* Roadmap Timeline Section */}
      <div id="roadmap-section" ref={roadmapRef}>
        <Roadmap scrollRef={roadmapRef} />
      </div>

      
      {/* Origin Story Section */}
      <div id="origin-section">
        <OriginStorySection />
      </div>
    </div>
  )
}