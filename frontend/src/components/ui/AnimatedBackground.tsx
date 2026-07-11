"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-space-black">
      {/* Living night sky background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-midnight-blue/50 via-space-black to-space-black"></div>
      
      {/* Aurora / soft moon glow */}
      <motion.div 
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-soft-indigo/10 blur-[120px]"
      />
      <motion.div 
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-moon-glow/5 blur-[150px]"
      />

      {/* Twinkling stars via CSS pattern */}
      <div className="absolute inset-0 stars mix-blend-screen"></div>

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: ["0vh", "-100vh"],
            x: Math.random() * 20 - 10,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 20,
          }}
          className="absolute bottom-0 w-1 h-1 rounded-full bg-moon-white/30 blur-[1px]"
          style={{
            left: `${Math.random() * 100}vw`,
          }}
        />
      ))}
    </div>
  );
};
