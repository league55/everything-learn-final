import React from 'react';
import { motion } from 'framer-motion';

export function RoadmapHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1] }}
      viewport={{ once: true, margin: "-100px" }}
      className="text-center mb-16"
    >
      <motion.h2 
        className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cosmic-400 to-cosmic-600 bg-clip-text text-transparent"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }}
        viewport={{ once: true }}
      >
        Your Learning Roadmap
      </motion.h2>
      <motion.p 
        className="text-xl text-space-300 max-w-3xl mx-auto leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        Follow our carefully crafted learning path to become a full-stack developer. 
        Each step builds upon the previous, ensuring a smooth journey to mastery.
      </motion.p>
    </motion.div>
  );
} 