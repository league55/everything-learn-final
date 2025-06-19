import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ComicPanel } from './comic-panel'
import { 
  BookOpen, 
  Bot, 
  Lightbulb, 
  Sparkles,
  FileQuestion,
  MessageSquare,
  Zap,
  Users
} from 'lucide-react'

const storyPanels = [
  {
    icon: FileQuestion,
    caption: "I was frustrated reading technical documentation...",
    speech: "Why is this so dense? I just want the right depth for me!",
    animationDirection: 'left' as const
  },
  {
    icon: Bot,
    caption: "Pure AI wasn't enough...",
    speech: "This is just a wall of text. Where's the structure? Where's the interactivity?",
    animationDirection: 'right' as const
  },
  {
    icon: Lightbulb,
    caption: "What if I could combine AI with structure and interactivity?",
    speech: "Let's build a better way to learn!",
    animationDirection: 'left' as const
  },
  {
    icon: Sparkles,
    caption: "That's how Orion Path was born.",
    speech: "Personalized, structured, interactive learning for everyone!",
    animationDirection: 'right' as const
  }
]

export function OriginStorySection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  return (
    <motion.section
      ref={containerRef}
      className="relative py-24 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.3)_1px,_transparent_0)] bg-[size:20px_20px]" />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-2 h-2 bg-purple-400 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-32 right-20 w-1 h-1 bg-pink-300 rounded-full"
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.5, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-purple-500 rounded-full"
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.3, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            How It All Started
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The story behind building a better way to learn
          </p>
        </motion.div>

        {/* Comic Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {storyPanels.map((panel, index) => (
            <ComicPanel
              key={index}
              icon={panel.icon}
              caption={panel.caption}
              speech={panel.speech}
              animationDirection={panel.animationDirection}
              delay={index * 0.2}
              className="w-full"
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 cursor-pointer border-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const heroSection = document.getElementById('hero-section')
              heroSection?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <Users className="h-5 w-5" />
            <span>Join thousands of learners</span>
            <Zap className="h-5 w-5" />
          </motion.div>
          
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            Start your personalized learning journey today
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}