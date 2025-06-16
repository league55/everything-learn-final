import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Sparkles, 
  BookOpen, 
  MessageCircleQuestion, 
  Video,
  ArrowRight,
  Zap,
  Brain,
  Users
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

export function RoadmapTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // Transform scroll progress to line height (0% to 100%)
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"])

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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
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
        <div className="relative">
          {/* Central Growing Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-background/20 transform -translate-x-1/2">
            <motion.div 
              className="w-full bg-gradient-to-b from-primary via-accent to-primary rounded-full shadow-lg shadow-primary/50"
              style={{ height: lineHeight }}
              initial={{ height: "0%" }}
            />
          </div>

          {/* Timeline Steps */}
          <div className="space-y-24">
            {roadmapSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* Step Content Card */}
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                  <motion.div
                    whileHover={{ 
                      scale: 1.02,
                      rotateY: index % 2 === 0 ? 5 : -5,
                      rotateX: 2
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative group"
                    style={{ 
                      perspective: "1000px",
                      transformStyle: "preserve-3d"
                    }}
                  >
                    {/* 3D Card */}
                    <div className="relative bg-background/10 backdrop-blur-sm border border-background/20 rounded-2xl p-8 shadow-2xl hover:shadow-primary/20 transition-all duration-500">
                      {/* Pulse Animation Ring */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-2xl opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500" />
                      
                      {/* Card Content */}
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative">
                            {/* Rotating Progress Ring */}
                            <div className="absolute inset-0 w-12 h-12 border-2 border-primary/30 rounded-full animate-spin" />
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
                        
                        {/* Details List */}
                        <ul className="space-y-2">
                          {step.details.map((detail, detailIndex) => (
                            <motion.li
                              key={detailIndex}
                              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + detailIndex * 0.1 }}
                              className="flex items-center gap-3 text-background/70"
                            >
                              <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                              <span className="text-sm">{detail}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>
                  </motion.div>
                </div>

                {/* Central Number Badge */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="relative"
                  >
                    {/* Outer Pulse Ring */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse opacity-50" />
                    
                    {/* Main Badge */}
                    <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl border-4 border-background/20">
                      <span className="text-2xl font-bold text-background">{step.id}</span>
                    </div>
                  </motion.div>
                </div>

                {/* Arrow Connector (except for last step) */}
                {index < roadmapSteps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-8 ${
                      index % 2 === 0 ? 'rotate-45' : '-rotate-45'
                    }`}
                  >
                    <ArrowRight className="h-6 w-6 text-primary/60" />
                  </motion.div>
                )}

                {/* Empty space for alternating layout */}
                <div className="w-5/12" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-full text-background font-semibold shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105">
            <Zap className="h-5 w-5" />
            <span>Start Your Journey Today</span>
            <Brain className="h-5 w-5" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}