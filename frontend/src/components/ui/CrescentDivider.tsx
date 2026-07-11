"use client";

import React from 'react';

export const CrescentDivider = () => {
  return (
    <div className="w-full flex justify-center py-12">
      <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 20C40 20 50 35 60 35C70 35 80 20 110 20" stroke="url(#crescent-gradient)" strokeWidth="1" strokeLinecap="round" />
        <circle cx="60" cy="20" r="2" fill="#EAE0C8" opacity="0.8" />
        <circle cx="40" cy="15" r="1" fill="#C0C0C0" opacity="0.5" />
        <circle cx="80" cy="15" r="1" fill="#C0C0C0" opacity="0.5" />
        
        <defs>
          <linearGradient id="crescent-gradient" x1="10" y1="20" x2="110" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F4F6F0" stopOpacity="0" />
            <stop offset="0.5" stopColor="#F4F6F0" stopOpacity="0.5" />
            <stop offset="1" stopColor="#F4F6F0" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
