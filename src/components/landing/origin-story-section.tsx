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
    speech: "Why is this so dense? This is abosolutely not what I meed at the moment!",
  },
  {
    icon: Bot,
    caption: "Just AI wasn't enough...",
    speech: "This is just a wall of text. No structure, no interactivity.",
  },
  {
    icon: Lightbulb,
    caption: "What if I could combine AI with structure and interactivity?",
    speech: "Let's build a better way to learn!",
  },
  {
    icon: Sparkles,
    caption: "That's how Orion Path was born.",
    speech: "Personalized, structured, interactive learning for everyone!",
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
      transition={{ duration: 0.6 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.3)_1px,_transparent_0)] bg-[size:20px_20px]" />
      </div>


      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
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
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className="w-full"
            >
              <ComicPanel
                icon={panel.icon}
                caption={panel.caption}
                speech={panel.speech}
                delay={0} // Remove staggered delays to reduce complexity
                className="w-full"
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <motion.button
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 cursor-pointer border-0"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={() => {
              const heroSection = document.getElementById('hero-section')
              heroSection?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <Users className="h-5 w-5" />
            <span>Join thousands of learners</span>
            <Zap className="h-5 w-5" />
          </motion.button>
          
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            Start your personalized learning journey today
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}