import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight, Star, Code, Database, Cloud, Shield, Zap } from 'lucide-react';
import { CosmicBackground } from '../roadmap/CosmicBackground';
import { RoadmapHeader } from '../roadmap/RoadmapHeader';
import { CallToActionSection } from '../roadmap/CallToActionSection';

interface RoadmapProps {}

export function Roadmap({}: RoadmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress within this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform scroll progress to line height (0% to 100%)
  const lineHeight = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"]);
  
  // Transform scroll progress for line thickness and glow
  const lineWidth = useTransform(scrollYProgress, [0.2, 0.8], [2, 6]);
  const glowIntensity = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);

  const roadmapSteps = [
    {
      id: 1,
      title: 'Generate Your Course',
      description: 'AI creates a personalized learning path tailored to your goals and depth preferences',
      skills: ['Choose your topic and context', 'Select learning depth (1-5 scale)', 'AI generates comprehensive syllabus', 'Structured modules and topics'],
      completed: false,
      duration: 'Instant',
      icon: <Zap size={24} />,
      color: 'from-green-400 to-green-600',
      progress: 0.25
    },
    {
      id: 2,
      title: 'Study & Learn',
      description: 'Engage with interactive content, exercises, and multimedia learning materials',
      skills: ['Interactive learning modules', 'Rich multimedia content', 'Progress tracking', 'Adaptive learning pace'],
      completed: false,
      duration: 'Self-paced',
      icon: <Code size={24} />,
      color: 'from-blue-400 to-blue-600',
      progress: 0.45
    },
    {
      id: 3,
      title: 'Get AI Assistance',
      description: 'Struggling with concepts? Our AI tutor provides instant help and explanations',
      skills: ['24/7 AI tutor availability', 'Contextual explanations', 'Personalized hints', 'Concept clarification'],
      completed: false,
      duration: 'On-demand',
      icon: <Database size={24} />,
      color: 'from-purple-400 to-purple-600',
      progress: 0.65
    },
    {
      id: 4,
      title: 'Video Tutor Session',
      description: 'Complete your journey with a final conversation with an AI video tutor',
      skills: ['Face-to-face AI interaction', 'Knowledge assessment', 'Personalized feedback', 'Course completion certificate'],
      completed: false,
      duration: '15-30 min',
      icon: <Shield size={24} />,
      color: 'from-orange-400 to-orange-600',
      progress: 0.85
    }
  ];

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.25, 0, 1],
        scale: {
          duration: 0.6,
          ease: "backOut"
        }
      }
    }
  };

  const skillVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "backOut"
      }
    }
  };

  return (
    <section 
      ref={containerRef}
      id="roadmap" 
      className="py-24 bg-gradient-to-b from-space-900 via-space-950 to-space-900 relative overflow-hidden"
    >
      <CosmicBackground />

      <div className="container mx-auto px-6 relative z-10">
        <RoadmapHeader />

        {/* Roadmap Timeline */}
        <div className="max-w-5xl mx-auto relative min-h-[200vh]">
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
            className="relative space-y-32"
          >
            {roadmapSteps.map((step, index) => {
              // Individual item scroll progress for more granular control
              const itemProgress = useTransform(
                scrollYProgress, 
                [step.progress - 0.2, step.progress + 0.1],
                [0, 1]
              );

              return (
                <motion.div
                  key={step.id}
                  className="relative"
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
                            "0 0 0px rgba(99, 102, 241, 0)",
                            "0 0 30px rgba(99, 102, 241, 0.6)",
                            "0 0 30px rgba(34, 197, 94, 0.8)"
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
                          }}
                        >
                          <span className="text-2xl font-bold text-space-400">{step.id}</span>
                        </motion.div>
                        
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            opacity: useTransform(itemProgress, [0, 0.25, 0.75], [0, 0, 1]),
                            scale: useTransform(itemProgress, [0, 0.25, 0.75], [0, 0, 1]),
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
                            opacity: useTransform(itemProgress, [0, 0.25, 0.75], [0.3, 0, 0]),
                            boxShadow: useTransform(itemProgress, [0, 0.1, 0.75], [
                              "0 0 15px rgba(99, 102, 241, 0.7)",
                              "0 0 0px rgba(99, 102, 241, 0)",
                              "0 0 0px rgba(99, 102, 241, 0)"
                            ])
                          }}
                          animate={{
                            scale: [1, 1.4, 1]
                          }}
                          transition={{
                            duration: 3,
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
            })}
          </motion.div>
        </div>

        <CallToActionSection />
      </div>
    </section>
  );
}