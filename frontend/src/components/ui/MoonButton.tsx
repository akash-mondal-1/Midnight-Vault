"use client";

import React, { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MoonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export const MoonButton = React.forwardRef<HTMLButtonElement, MoonButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ease-out overflow-hidden";
    
    const variants = {
      primary: "bg-moon-white text-space-black hover:bg-white shadow-[0_0_15px_rgba(244,246,240,0.3)] hover:shadow-[0_0_25px_rgba(244,246,240,0.5)]",
      secondary: "bg-midnight-blue/50 text-moon-white backdrop-blur-md border border-white/10 hover:bg-midnight-blue/80 hover:border-white/20",
      outline: "bg-transparent text-moon-white border border-silver/30 hover:border-moon-white hover:shadow-[0_0_15px_rgba(244,246,240,0.2)]"
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], className)}
        {...(props as any)}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        {/* Moonlight ripple effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transform -translate-x-full hover:translate-x-full transition-all duration-1000 ease-in-out" />
      </motion.button>
    );
  }
);

MoonButton.displayName = "MoonButton";
