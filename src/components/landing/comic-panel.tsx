import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { DivideIcon as LucideIcon } from 'lucide-react'
import Typewriter from 'typewriter-effect'
import { cn } from '@/lib/utils'

interface ComicPanelProps {
  icon: LucideIcon
  caption: string
  speech: string
  animationDirection?: 'left' | 'right' | 'up'
  delay?: number
  className?: string
}

export function ComicPanel({ 
  icon: Icon, 
  caption, 
  speech, 
  animationDirection = 'up',
  delay = 0,
  className 
}: ComicPanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const getAnimationVariants = () => {
    const directions = {
      left: { x: -60, y: 0 },
      right: { x: 60, y: 0 },
      up: { x: 0, y: 60 }
    }
    
    return {
      hidden: { 
        opacity: 0, 
        scale: 0.8,
        ...directions[animationDirection]
      },
      visible: { 
        opacity: 1, 
        scale: 1,
        x: 0,
        y: 0
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      className={cn("relative group cursor-pointer", className)}
      variants={getAnimationVariants()}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ 
        duration: 0.8, 
        delay: delay,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        rotateY: 2,
        rotateX: 1
      }}
      style={{ 
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
    >
      {/* Panel Background with Comic Style */}
      <div className="relative bg-white/90 dark:bg-card/90 backdrop-blur-sm border-2 border-border rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/20 transition-all duration-700 min-h-[400px] flex flex-col">
        {/* Glow effect on hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center flex-1">
          {/* Icon Container with Comic Style */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Icon className="h-12 w-12 text-white" />
            </div>
            {/* Comic style "pow" effect - removed scale, only opacity */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-xs font-bold">✨</span>
            </div>
          </div>

          {/* Caption */}
          <motion.h3 
            className="text-2xl font-bold text-foreground mb-6 leading-tight"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: delay + 0.3, duration: 0.6 }}
          >
            {caption}
          </motion.h3>

          {/* Speech Bubble */}
          <div className="relative bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 mt-auto max-w-sm">
            {/* Speech bubble pointer */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l border-t border-purple-200 dark:border-purple-800 rotate-45"></div>
            
            <div className="text-lg text-foreground font-medium relative z-10">
              {isInView && (
                <Typewriter
                  options={{
                    strings: [speech],
                    autoStart: true,
                    delay: 50,
                    deleteSpeed: Infinity,
                    cursor: '',
                    loop: false
                  }}
                  onInit={(typewriter) => {
                    typewriter.start()
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}