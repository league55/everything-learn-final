import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { 
  Sparkles, 
  BookOpen, 
  MessageCircleQuestion, 
  Video,
  ArrowRight,
  Zap,
  Brain
} from 'lucide-react'

interface RoadmapStep {
  id: number
  title: string
  description: string
  icon: React.ComponentType<any>
  details: string[]
}

const roadmapSteps: RoadmapStep[] = [
  {
    id: 1,
    title: "Generate Your Course",
    description: "AI creates a personalized learning path tailored to your goals and depth preferences",
    icon: Sparkles,
    details: [
      "Choose your topic and context",
      "Select learning depth (1-5 scale)",
      "AI generates comprehensive syllabus",
      "Structured modules and topics"
    ]
  },
  {
    id: 2,
    title: "Study & Learn",
    description: "Engage with interactive content, exercises, and multimedia learning materials",
    icon: BookOpen,
    details: [
      "Interactive learning modules",
      "Rich multimedia content",
      "Progress tracking",
      "Adaptive learning pace"
    ]
  },
  {
    id: 3,
    title: "Get AI Assistance",
    description: "Struggling with concepts? Our AI tutor provides instant help and explanations",
    icon: MessageCircleQuestion,
    details: [
      "24/7 AI tutor availability",
      "Contextual explanations",
      "Personalized hints",
      "Concept clarification"
    ]
  },
  {
    id: 4,
    title: "Video Tutor Session",
    description: "Complete your journey with a final conversation with an AI video tutor",
    icon: Video,
    details: [
      "Face-to-face AI interaction",
      "Knowledge assessment",
      "Personalized feedback",
      "Course completion certificate"
    ]
  }
]

function RoadmapStepComponent({ step, index }: { step: RoadmapStep; index: number }) {
  const stepRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(stepRef, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={stepRef}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
      className={`relative flex items-center ${
        index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
      }`}
    >
      {/* Step Content Card */}
      <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
        <motion.div
          whileHover={{ 
            scale: 1.03,
            rotateY: index % 2 === 0 ? 8 : -8,
            rotateX: 3
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative group cursor-pointer"
          style={{ 
            perspective: "1000px",
            transformStyle: "preserve-3d"
          }}
        >
          {/* 3D Card */}
          <div className="relative bg-background/10 backdrop-blur-sm border border-background/20 rounded-2xl p-8 shadow-2xl hover:shadow-primary/20 transition-all duration-700">
            {/* Slow Pulse Animation Ring - Fixed timing */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="w-full h-full rounded-2xl animate-pulse" style={{ animationDuration: '3s' }} />
            </div>
            
            {/* Card Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  {/* Slow Rotating Progress Ring - Fixed to be circular */}
                  <div 
                    className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent bg-gradient-to-r from-primary/40 to-accent/40 group-hover:animate-spin"
                    style={{ 
                      animationDuration: '4s',
                      mask: 'radial-gradient(circle at center, transparent 18px, black 20px)',
                      WebkitMask: 'radial-gradient(circle at center, transparent 18px, black 20px)'
                    }}
                  />
                  {/* Fixed circular icon container */}
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                    <step.icon className="h-6 w-6 text-background" />
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-background/60">Step {step.id}</span>
                  <h3 className="text-2xl font-bold text-background">{step.title}</h3>
                </div>
              </div>
              
              <p className="text-background/80 mb-6 leading-relaxed">
                {step.description}
              </p>
              
              {/* Details List with staggered animation */}
              <ul className="space-y-2">
                {step.details.map((detail, detailIndex) => (
                  <motion.li
                    key={detailIndex}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    transition={{ 
                      delay: 0.5 + index * 0.2 + detailIndex * 0.1,
                      duration: 0.6,
                      ease: "easeOut"
                    }}
                    className="flex items-center gap-3 text-background/70"
                  >
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-sm">{detail}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Subtle Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </div>
        </motion.div>
      </div>

      {/* Central Number Badge */}
      <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
          transition={{ 
            delay: index * 0.2 + 0.3,
            duration: 0.8,
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
          whileHover={{ scale: 1.15, rotate: 360 }}
          className="relative"
        >
          {/* Slow Outer Pulse Ring */}
          <div 
            className="absolute -inset-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          
          {/* Main Badge - Fixed to be perfectly circular */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl border-4 border-background/20">
            <span className="text-2xl font-bold text-background">{step.id}</span>
          </div>
        </motion.div>
      </div>

      {/* Arrow Connector (except for last step) */}
      {index < roadmapSteps.length - 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: index % 2 === 0 ? 0 : 90 }}
          animate={isInView ? { 
            opacity: 1, 
            scale: 1, 
            rotate: index % 2 === 0 ? 45 : -45 
          } : { 
            opacity: 0, 
            scale: 0, 
            rotate: index % 2 === 0 ? 0 : 90 
          }}
          transition={{ 
            delay: index * 0.2 + 0.8,
            duration: 0.6,
            type: "spring",
            stiffness: 200
          }}
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-8"
        >
          <ArrowRight className="h-6 w-6 text-primary/60" />
        </motion.div>
      )}

      {/* Empty space for alternating layout */}
      <div className="w-5/12" />
    </motion.div>
  )
}

export function RoadmapTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  
  // Fixed scroll progress tracking for the entire roadmap section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  })

  // Transform scroll progress to line height with better easing
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <section 
      ref={containerRef}
      className="relative py-24 bg-foreground text-background overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.3)_1px,_transparent_0)] bg-[size:20px_20px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-background to-background/70 bg-clip-text text-transparent">
            Your Learning Journey
          </h2>
          <p className="text-xl text-background/70 max-w-2xl mx-auto">
            From course creation to mastery - experience the future of personalized education
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div ref={timelineRef} className="relative">
          {/* Central Growing Line - Fixed positioning and animation */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-background/20 transform -translate-x-1/2">
            <motion.div 
              className="w-full bg-gradient-to-b from-primary via-accent to-primary rounded-full shadow-lg shadow-primary/50 origin-top"
              style={{ height: lineHeight }}
              initial={{ height: "0%" }}
            />
          </div>

          {/* Timeline Steps */}
          <div className="space-y-24">
            {roadmapSteps.map((step, index) => (
              <RoadmapStepComponent key={step.id} step={step} index={index} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-full text-background font-semibold shadow-2xl hover:shadow-primary/30 transition-all duration-300 cursor-pointer"
          >
            <Zap className="h-5 w-5" />
            <span>Start Your Journey Today</span>
            <Brain className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}