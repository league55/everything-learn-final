import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { DivideIcon as LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComicPanelProps {
  icon: LucideIcon
  caption: string
  speech: string
  delay?: number
  className?: string
}

export function ComicPanel({ 
  icon: Icon, 
  caption, 
  speech, 
  delay = 0,
  className 
}: ComicPanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })


  return (
    <div
      ref={ref}
      className={cn("relative group", className)}
    >
      {/* Panel Background with Comic Style */}
      <div className="relative bg-white/90 dark:bg-card/90 backdrop-blur-sm border-2 border-border rounded-3xl p-8 shadow-2xl hover:shadow-lg transition-shadow duration-300 min-h-[400px] flex flex-col">
        {/* Glow effect on hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center flex-1">
          {/* Icon Container with Comic Style */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-xl transition-shadow duration-300">
              <Icon className="h-12 w-12 text-white" />
            </div>
            {/* Comic style "pow" effect */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-xs font-bold">✨</span>
            </div>
          </div>

          {/* Caption */}
          <h3 className="text-2xl font-bold text-foreground mb-6 leading-tight">
            {caption}
          </h3>

          {/* Speech Bubble */}
          <div className="relative bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 mt-auto max-w-sm">
            {/* Speech bubble pointer */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l border-t border-purple-200 dark:border-purple-800 rotate-45"></div>
            
            <p className="text-lg text-foreground font-medium relative z-10">
              {speech}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}