"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MoonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowOnHover?: boolean;
}

export const MoonCard = React.forwardRef<HTMLDivElement, MoonCardProps>(
  ({ className, children, glowOnHover = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={glowOnHover ? { y: -5, boxShadow: "0 10px 40px -10px rgba(244,246,240,0.15)" } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "relative bg-midnight-blue/40 backdrop-blur-xl border border-white/5",
          "rounded-[32px] p-8 overflow-hidden",
          "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
          className
        )}
        {...(props as any)}
      >
        {/* Subtle top crescent highlight */}
        <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
);

MoonCard.displayName = "MoonCard";
