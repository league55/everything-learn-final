import React from 'react';
import { motion } from 'framer-motion';

export function CosmicBackground() {
  return (
    <>
      {/* Enhanced background cosmic elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div 
          className="absolute top-20 left-10 w-2 h-2 bg-cosmic-400 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-32 right-20 w-1 h-1 bg-cosmic-300 rounded-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-cosmic-500 rounded-full"
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-cosmic-200 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      {/* Enhanced background gradients */}
      <div className="absolute inset-0 opacity-30">
        <motion.div 
          className="absolute top-1/4 left-10 w-40 h-40 bg-cosmic-500 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-10 w-32 h-32 bg-cosmic-600 rounded-full blur-3xl"
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </>
  );
} 