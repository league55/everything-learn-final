import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight, Star } from 'lucide-react';

interface RoadmapStepProps {
  step: {
    id: number;
    title: string;
    description: string;
    skills: string[];
    completed: boolean;
    duration: string;
    icon: React.ReactNode;
    color: string;
    progress: number;
  };
  index: number;
  itemProgress: MotionValue<number>;
  skillVariants: any; // Define a more specific type if possible
}

export function RoadmapStep({ step, index, itemProgress, skillVariants }: RoadmapStepProps) {
  return (
    <motion.div
      key={step.id}
      className="relative mb-20 last:mb-0"
      style={{
        opacity: itemProgress,
        scale: useTransform(itemProgress, [0, 1], [0.8, 1]),
      }}
    >
      <div className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Enhanced content with better hover effects */}
        <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-12' : 'text-left pl-12'}`}>
          <motion.div
            className="bg-space-800/50 backdrop-blur-sm border border-space-700 rounded-2xl p-8 group relative overflow-hidden"
            whileHover={{ 
              scale: 1.03,
              y: -8,
              rotateY: index % 2 === 0 ? -2 : 2,
              rotateX: 2
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
            style={{
              transformStyle: "preserve-3d",
              perspective: 1000
            }}
          >
            {/* Enhanced hover overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-cosmic-400/5 to-cosmic-600/5 rounded-2xl opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />
            
            {/* Animated border on hover */}
            <motion.div
              className="absolute inset-0 rounded-2xl border border-cosmic-500/0 group-hover:border-cosmic-500/50"
              transition={{ duration: 0.3 }}
            />

            {/* Header with enhanced animations */}
            <div className={`flex items-center justify-between mb-6 ${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex items-center gap-3 ${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                <motion.div
                  className={`p-3 rounded-xl bg-gradient-to-r ${step.color} relative overflow-hidden`}
                  whileHover={{ 
                    scale: 1.15,
                    rotate: [0, -5, 5, 0],
                    boxShadow: "0 0 25px rgba(99, 102, 241, 0.4)"
                  }}
                  transition={{ 
                    duration: 0.4,
                    rotate: { duration: 0.6, ease: "easeInOut" }
                  }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                  <div className="text-white relative z-10">
                    {step.icon}
                  </div>
                </motion.div>
                <motion.h3 
                  className="text-2xl font-bold text-white group-hover:text-cosmic-400"
                  transition={{ duration: 0.3 }}
                >
                  {step.title}
                </motion.h3>
              </div>
              
              <motion.div 
                className="flex items-center text-cosmic-400 text-sm"
                whileHover={{ scale: 1.05 }}
              >
                <Star size={16} className="mr-1" />
                <span>{step.duration}</span>
              </motion.div>
            </div>
            
            <motion.p 
              className="text-space-300 mb-6 leading-relaxed group-hover:text-space-200"
              transition={{ duration: 0.3 }}
            >
              {step.description}
            </motion.p>
            
            {/* Enhanced skills grid with staggered animations */}
            <motion.div 
              className="grid grid-cols-2 gap-3 mb-6"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {step.skills.map((skill, skillIndex) => (
                <motion.span
                  key={skillIndex}
                  variants={skillVariants}
                  className="px-3 py-2 bg-cosmic-500/10 text-cosmic-300 rounded-lg text-sm border border-cosmic-500/20 text-center relative overflow-hidden group/skill"
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: "rgba(99, 102, 241, 0.15)",
                    borderColor: "rgba(99, 102, 241, 0.4)"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Skill hover effect */}
                  <motion.div
                    className="absolute inset-0 bg-cosmic-400/10"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <span className="relative z-10">{skill}</span>
                </motion.span>
              ))}
            </motion.div>
            
            {/* Enhanced status indicator */}
            {step.completed ? (
              <motion.div 
                className="flex items-center text-green-400 text-sm font-medium"
                initial={{ scale: 0, x: index % 2 === 0 ? 20 : -20 }}
                whileInView={{ scale: 1, x: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                viewport={{ once: true }}
              >
                <CheckCircle size={16} className="mr-2" />
                <span>Completed</span>
              </motion.div>
            ) : (
              <motion.button
                className="flex items-center text-cosmic-400 text-sm font-medium group/btn relative"
                whileHover={{ 
                  x: index % 2 === 0 ? -5 : 5,
                  color: "#a5b4fc"
                }}
                transition={{ duration: 0.2 }}
              >
                <span>Start Learning</span>
                <ArrowRight 
                  size={16} 
                  className="ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" 
                />
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Enhanced center circle with advanced animations */}
        <div className="w-2/12 flex justify-center relative z-20">
          <motion.div
            className="relative w-20 h-20 rounded-full border-4 flex items-center justify-center"
            style={{
              background: useTransform(itemProgress, [0, 0.25, 0.75], [
                'linear-gradient(to right, rgb(31, 41, 55), rgb(17, 24, 39))',
                'linear-gradient(to right, rgb(31, 41, 55), rgb(17, 24, 39))',
                'linear-gradient(to right, rgb(74, 222, 128), rgb(22, 163, 74))'
              ]),
              borderColor: useTransform(itemProgress, [0, 0.25, 0.75], [
                'rgb(75, 85, 99)',
                'rgb(75, 85, 99)',
                'rgb(74, 222, 128)'
              ]),
              boxShadow: useTransform(itemProgress, [0, 0.1, 0.75], [
                "0 0 0px rgba(99, 102, 241, 0)", // No shadow at start
                "0 0 50px rgba(99, 102, 241, 0.8)", // Stronger Cosmic glow in middle
                "0 0 50px rgba(34, 197, 94, 1.0)"  // Stronger Green glow at end
              ]),
            }}
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 200
            }}
            viewport={{ once: true }}
            whileHover={{ 
              scale: 1.15,
              rotate: 5
            }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: useTransform(itemProgress, [0, 0.25, 0.75], [1, 1, 0]),
                scale: useTransform(itemProgress, [0, 0.25, 0.75], [1, 1, 0]),
                y: -1, // Nudge up by 1px
              }}
            >
              <Circle size={28} className="text-space-400" />
            </motion.div>
            
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: useTransform(itemProgress, [0, 0.25, 0.75], [0, 0, 1]),
                scale: useTransform(itemProgress, [0, 0.25, 0.75], [0, 0, 1]),
                y: -1, // Nudge up by 1px
              }}
            >
              <CheckCircle size={28} className="text-white" />
            </motion.div>
            
            {/* Enhanced progress indicator ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cosmic-400"
              style={{
                opacity: useTransform(itemProgress, [0, 1], [0, 0.6]),
                scale: useTransform(itemProgress, [0, 1], [0.8, 1.1])
              }}
              animate={{
                rotate: 360
              }}
              transition={{
                rotate: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }
              }}
            />
            
            {/* Pulse ring for active items */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cosmic-400"
              style={{
                opacity: useTransform(itemProgress, [0, 0.25, 0.75], [0.5, 0, 0]),
                boxShadow: useTransform(itemProgress, [0, 0.1, 0.75], [
                  "0 0 20px rgba(99, 102, 241, 1.0)", // Much stronger initial cosmic pulse glow
                  "0 0 0px rgba(99, 102, 241, 0)",  // No pulse glow in middle
                  "0 0 0px rgba(99, 102, 241, 0)"   // No pulse glow at end
                ])
              }}
              animate={{
                scale: [1, 1.4, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>

        {/* Empty space */}
        <div className="w-5/12"></div>
      </div>
    </motion.div>
  );
} 