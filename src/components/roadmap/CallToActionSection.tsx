import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

export function CallToActionSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      viewport={{ once: true, margin: "-100px" }}
      className="text-center mt-20"
    >
      <motion.button
        className="px-12 py-4 bg-gradient-to-r from-cosmic-500 to-cosmic-600 text-white font-semibold rounded-full hover:from-cosmic-600 hover:to-cosmic-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto relative overflow-hidden group"
        whileHover={{ 
          scale: 1.05, 
          y: -2,
          boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)"
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Animated background on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cosmic-600 to-cosmic-700"
          initial={{ x: "-100%" }}
          whileHover={{ x: "0%" }}
          transition={{ duration: 0.3 }}
        />
        <Zap size={20} className="relative z-10" />
        <span className="relative z-10">Start Your Journey</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
      </motion.button>
      
      <motion.p
        className="text-space-400 mt-4 text-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        viewport={{ once: true }}
      >
        Join thousands of developers who've transformed their careers
      </motion.p>
    </motion.div>
  );
} 