import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { RoadmapStep } from './RoadmapStep';

interface RoadmapTimelineProps {
  scrollYProgress: MotionValue<number>;
  lineHeight: MotionValue<string>;
  lineWidth: MotionValue<number>;
  glowIntensity: MotionValue<number>;
  roadmapSteps: Array<{
    id: number;
    title: string;
    description: string;
    skills: string[];
    completed: boolean;
    duration: string;
    icon: React.ReactNode;
    color: string;
    progress: number;
  }>;
  containerVariants: any; // Consider more specific type
  itemVariants: any;    // Consider more specific type
  skillVariants: any;   // Consider more specific type
}

export function RoadmapTimeline({
  scrollYProgress,
  lineHeight,
  lineWidth,
  glowIntensity,
  roadmapSteps,
  containerVariants,
  itemVariants,
  skillVariants,
}: RoadmapTimelineProps) {
  return (
    <div className="max-w-5xl mx-auto relative min-h-[400vh]">
      {/* Enhanced central animated timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2 z-0">
        {/* Background line */}
        <div className="w-1 h-full bg-space-700 rounded-full"></div>
        
        {/* Animated growing line with enhanced effects */}
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-b from-cosmic-400 via-cosmic-500 to-cosmic-600 rounded-full origin-top"
          style={{
            height: lineHeight,
            width: lineWidth,
          }}
        />
        
        {/* Enhanced animated glow effect */}
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-b from-cosmic-400 via-cosmic-500 to-cosmic-600 rounded-full origin-top blur-md"
          style={{
            height: lineHeight,
            width: useTransform(lineWidth, (w) => w * 3),
            opacity: useTransform(glowIntensity, (i) => i * 0.8),
          }}
        />
      </div>

      {/* Timeline items */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="relative"
      >
        {roadmapSteps.map((step, index) => {
          // Individual item scroll progress for more granular control
          const itemProgress = useTransform(
            scrollYProgress, 
            [step.progress - 0.3, step.progress + 0.2],
            [0, 1]
          );

          // Log itemProgress to console for debugging
          React.useEffect(() => {
            const unsubscribe = itemProgress.onChange((latest) => {
              console.log(`Step ${step.id} itemProgress: ${latest.toFixed(2)}`);
            });
            return () => unsubscribe();
          }, [itemProgress, step.id]);

          return (
            <RoadmapStep
              key={step.id}
              step={step}
              index={index}
              itemProgress={itemProgress}
              skillVariants={skillVariants}
            />
          );
        })}
      </motion.div>
    </div>
  );
} 