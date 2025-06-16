import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight, Star, Code, Database, Cloud, Shield, Zap } from 'lucide-react';
import { CosmicBackground } from '../roadmap/CosmicBackground';
import { RoadmapHeader } from '../roadmap/RoadmapHeader';
import { RoadmapTimeline } from '../roadmap/RoadmapTimeline';
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
      title: 'Foundation',
      description: 'Master the fundamentals of web development',
      skills: ['HTML/CSS', 'JavaScript ES6+', 'Git & Version Control', 'Responsive Design'],
      completed: true,
      duration: '4-6 weeks',
      icon: <Code size={24} />,
      color: 'from-green-400 to-green-600',
      progress: 0.15
    },
    {
      id: 2,
      title: 'Frontend Development',
      description: 'Build interactive and dynamic user interfaces',
      skills: ['React/Vue.js', 'State Management', 'Component Architecture', 'Testing'],
      completed: true,
      duration: '8-10 weeks',
      icon: <Zap size={24} />,
      color: 'from-blue-400 to-blue-600',
      progress: 0.35
    },
    {
      id: 3,
      title: 'Backend Development',
      description: 'Create robust server-side applications',
      skills: ['Node.js/Python', 'RESTful APIs', 'Authentication', 'Error Handling'],
      completed: false,
      duration: '10-12 weeks',
      icon: <Database size={24} />,
      color: 'from-purple-400 to-purple-600',
      progress: 0.55
    },
    {
      id: 4,
      title: 'Database & Storage',
      description: 'Design and manage data persistence',
      skills: ['SQL/NoSQL', 'Database Design', 'Data Modeling', 'Performance Optimization'],
      completed: false,
      duration: '6-8 weeks',
      icon: <Shield size={24} />,
      color: 'from-orange-400 to-orange-600',
      progress: 0.75
    },
    {
      id: 5,
      title: 'DevOps & Deployment',
      description: 'Scale and deploy production applications',
      skills: ['Docker', 'CI/CD Pipelines', 'Cloud Platforms', 'Monitoring'],
      completed: false,
      duration: '8-10 weeks',
      icon: <Cloud size={24} />,
      color: 'from-cosmic-400 to-cosmic-600',
      progress: 0.95
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
      id="roadmap" 
      className="min-h-screen py-24 bg-gradient-to-b from-space-900 via-space-950 to-space-900 relative overflow-hidden"
    >
      <CosmicBackground />

      <div className="container mx-auto px-6 relative z-10">
        <RoadmapHeader />

        <RoadmapTimeline
          scrollYProgress={scrollYProgress}
          lineHeight={lineHeight}
          lineWidth={lineWidth}
          glowIntensity={glowIntensity}
          roadmapSteps={roadmapSteps}
          containerVariants={containerVariants}
          itemVariants={itemVariants}
          skillVariants={skillVariants}
        />

        <CallToActionSection />
      </div>
    </section>
  );
}