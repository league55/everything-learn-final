import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { 
  Sparkles, 
  BookOpen, 
  MessageCircleQuestion, 
  Video,
  CheckCircle,
  ArrowDown
} from 'lucide-react'

const timelineSteps = [
  {
    id: 1,
    title: "Generate Your Course",
    description: "Our AI creates a personalized curriculum tailored to your learning goals and preferred depth level.",
    icon: Sparkles,
    color: "from-blue-500 to-purple-600",
    details: "Advanced AI analyzes your topic and context to build a comprehensive learning path with modules, topics, and structured content."
  },
  {
    id: 2,
    title: "Study & Learn",
    description: "Dive into interactive content, practice exercises, and multimedia materials designed for your learning style.",
    icon: BookOpen,
    color: "from-purple-600 to-pink-600",
    details: "Engage with text, videos, interactive exercises, and real-world examples. Track your progress through each module."
  },
  {
    id: 3,
    title: "Get AI Assistance",
    description: "Struggling with a concept? Our AI tutor provides instant help, explanations, and alternative learning approaches.",
    icon: MessageCircleQuestion,
    color: "from-pink-600 to-orange-500",
    details: "24/7 AI support helps clarify concepts, provides additional examples, and adapts explanations to your learning pace."
  },
  {
    id: 4,
    title: "Video Tutor Session",
    description: "Complete your learning journey with a personalized video conversation with an AI tutor to solidify your knowledge.",
    icon: Video,
    color: "from-orange-500 to-green-500",
    details: "Interactive video sessions test your understanding, provide feedback, and ensure you've mastered the material."
  }
]

export function TimelineRoadmap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })
  
  // Track scroll progress through the timeline section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"]
  })

  // Use useTransform for smooth 60fps animations
  const lineProgress = useTransform(scrollYProgress, [0, 1], [0, 1])
  const lineOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1])
  
  // Dynamic glow effects based on scroll progress
  const glowOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 0.6, 0.9, 1])
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.5])
  const glowBlur = useTransform(scrollYProgress, [0, 1], [4, 12])
  
  return (
    <section ref={containerRef} className="relative py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1] }}
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="block bg-gradient-to-r from-[#323e65] to-[#a7bfd9] bg-clip-text text-transparent">
              Your Learning Journey
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience a revolutionary approach to learning with AI-powered course generation, 
            personalized support, and interactive video tutoring.
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div ref={timelineRef} className="relative min-h-[800px]">
          {/* Background Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-border/30 rounded-full" />
          
          {/* Animated Central Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 overflow-hidden rounded-full">
            <motion.div
              className="w-full bg-gradient-to-b from-[#6366f1] via-[#8b5cf6] via-[#ec4899] to-[#10b981] shadow-lg relative"
              style={{ 
                height: "100%",
                scaleY: lineProgress,
                opacity: lineOpacity,
                originY: 0
              }}
            >
              {/* Primary Glow Effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/60 via-[#8b5cf6]/60 via-[#ec4899]/60 to-[#10b981]/60"
                style={{
                  opacity: glowOpacity,
                  scale: glowScale,
                  filter: `blur(${glowBlur}px)`
                }}
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Secondary Glow Layer for Extra Intensity */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/40 via-[#8b5cf6]/40 via-[#ec4899]/40 to-[#10b981]/40"
                style={{
                  opacity: glowOpacity,
                  scale: useTransform(scrollYProgress, [0, 1], [1.2, 2]),
                  filter: `blur(${useTransform(scrollYProgress, [0, 1], [8, 20])}px)`
                }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Tertiary Outer Glow */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/20 via-[#8b5cf6]/20 via-[#ec4899]/20 to-[#10b981]/20"
                style={{
                  opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.3, 0.6]),
                  scale: useTransform(scrollYProgress, [0, 1], [1.5, 3]),
                  filter: `blur(${useTransform(scrollYProgress, [0, 1], [16, 32])}px)`
                }}
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Moving dot at the end of the line */}
              <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-current"
                style={{
                  opacity: lineProgress
                }}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Glowing dot effect */}
              <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full"
                style={{
                  opacity: useTransform(scrollYProgress, [0, 1], [0, 0.8]),
                  scale: useTransform(scrollYProgress, [0, 1], [1, 2]),
                  filter: `blur(${useTransform(scrollYProgress, [0, 1], [2, 8])}px)`
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </div>

          {/* Timeline Steps */}
          <div className="space-y-32 relative z-10">
            {timelineSteps.map((step, index) => {
              const isEven = index % 2 === 0
              
              return (
                <motion.div
                  key={step.id}
                  className={`relative flex items-center ${isEven ? 'justify-start' : 'justify-end'}`}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-150px" }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.15,
                    ease: [0.25, 0.25, 0, 1]
                  }}
                >
                  {/* Timeline Item */}
                  <div className={`w-5/12 ${isEven ? 'pr-20' : 'pl-20'}`}>
                    <motion.div
                      className="relative group"
                      whileHover={{ 
                        scale: 1.03,
                        y: -8
                      }}
                      transition={{ 
                        duration: 0.3,
                        ease: [0.25, 0.25, 0, 1]
                      }}
                    >
                      {/* Card */}
                      <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl group-hover:shadow-2xl group-hover:border-border transition-all duration-500">
                        {/* Step Number and Icon */}
                        <div className="flex items-center gap-4 mb-6">
                          <motion.div 
                            className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}
                            whileHover={{ 
                              scale: 1.1,
                              rotate: 360
                            }}
                            transition={{ 
                              duration: 0.6,
                              ease: [0.25, 0.25, 0, 1]
                            }}
                          >
                            <span className="text-white font-bold text-lg">{step.id}</span>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 12 }}
                            transition={{ duration: 0.3 }}
                          >
                            <step.icon className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
                          </motion.div>
                        </div>

                        {/* Content */}
                        <h3 className="text-2xl font-bold mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#323e65] group-hover:to-[#a7bfd9] group-hover:bg-clip-text transition-all duration-300">
                          {step.title}
                        </h3>
                        <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                          {step.description}
                        </p>
                        <p className="text-sm text-muted-foreground/80 leading-relaxed">
                          {step.details}
                        </p>

                        {/* Hover gradient overlay */}
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
                        
                        {/* Subtle border glow on hover */}
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 pointer-events-none`} />
                      </div>
                    </motion.div>
                  </div>

                  {/* Central Timeline Node */}
                  <motion.div
                    className="absolute left-1/2 transform -translate-x-1/2 z-20"
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-150px" }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.15 + 0.3,
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                    whileHover={{
                      scale: 1.3,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${step.color} shadow-lg border-4 border-background relative`}>
                      {/* Pulsing ring effect */}
                      <motion.div 
                        className={`absolute inset-0 rounded-full bg-gradient-to-r ${step.color}`}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>

          {/* Bottom completion indicator */}
          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ scale: 0, opacity: 0, y: 30 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.8, 
              delay: 0.5,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg border-4 border-background relative">
              <CheckCircle className="h-4 w-4 text-white" />
              {/* Celebratory pulse effect */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.6, 0, 0.6]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.25, 0, 1] }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-8 w-8 text-muted-foreground/50 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#323e65] to-[#a7bfd9] bg-clip-text text-transparent">
            Ready to start your learning journey?
          </h3>
          <p className="text-muted-foreground">
            Scroll back up and create your first AI-powered course
          </p>
        </motion.div>
      </div>
    </section>
  )
}