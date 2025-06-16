import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Sparkles, 
  BookOpen, 
  MessageCircleQuestion, 
  Video,
  ArrowRight,
  Zap,
  Brain,
  CheckCircle
} from 'lucide-react';

interface RoadmapStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  details: string[];
  color: string;
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
    ],
    color: "from-purple-500 to-pink-500"
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
    ],
    color: "from-blue-500 to-cyan-500"
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
    ],
    color: "from-green-500 to-emerald-500"
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
    ],
    color: "from-orange-500 to-red-500"
  }
];

function RoadmapStepComponent({ step, index }: { step: RoadmapStep; index: number }) {
  const stepRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(stepRef, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={stepRef}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
      className={`relative flex items-center mb-24 ${
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
          {/* Card */}
          <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl hover:shadow-purple-500/20 transition-all duration-700">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm" />
            
            {/* Card Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  {/* Icon container */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-white/60">Step {step.id}</span>
                  <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                </div>
              </div>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                {step.description}
              </p>
              
              {/* Details List */}
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
                    className="flex items-center gap-3 text-white/70"
                  >
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                    <span className="text-sm">{detail}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
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
          {/* Outer glow ring */}
          <div className="absolute -inset-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full animate-pulse" />
          
          {/* Main Badge */}
          <div className={`relative w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20`}>
            <span className="text-2xl font-bold text-white">{step.id}</span>
          </div>
        </motion.div>
      </div>

      {/* Empty space for alternating layout */}
      <div className="w-5/12" />
    </motion.div>
  );
}

export function Roadmap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress through the roadmap section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Transform scroll progress to line height
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section 
      ref={containerRef}
      className="relative py-24 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden min-h-screen"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.3)_1px,_transparent_0)] bg-[size:20px_20px]" />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-2 h-2 bg-purple-400 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-32 right-20 w-1 h-1 bg-pink-300 rounded-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-purple-500 rounded-full"
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
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
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Your Learning Journey
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            From course creation to mastery - experience the future of personalized education
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div ref={timelineRef} className="relative">
          {/* Central Growing Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/20 transform -translate-x-1/2">
            <motion.div 
              className="w-full bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 rounded-full shadow-lg shadow-purple-500/50 origin-top"
              style={{ height: lineHeight }}
              initial={{ height: "0%" }}
            />
            {/* Glow effect */}
            <motion.div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 rounded-full blur-md shadow-2xl shadow-purple-500/80 origin-top"
              style={{ height: lineHeight }}
              initial={{ height: "0%" }}
            />
          </div>

          {/* Timeline Steps */}
          <div className="space-y-0">
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 cursor-pointer border-0"
          >
            <Zap className="h-5 w-5" />
            <span>Start Your Journey Today</span>
            <Brain className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}