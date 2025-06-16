import { AnimatedBackground } from '@/components/landing/animated-background'
import { CourseForm } from '@/components/landing/course-form' 
import { Roadmap } from '@/components/landing/roadmap'
import { ShootingStars } from '@/components/landing/shoting-stars'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
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
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <motion.div
            className="flex flex-col items-center gap-2 text-muted-foreground cursor-pointer group"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            onClick={() => {
              const roadmapSection = document.getElementById('roadmap-section')
              roadmapSection?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <span className="text-sm font-medium group-hover:text-foreground transition-colors">
              Scroll to explore
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
      <div id="roadmap-section">
        <Roadmap />
      </div>
    </div>
  )
}