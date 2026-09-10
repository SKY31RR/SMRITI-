import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean; // Included in the official logo image itself
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const heights = {
    sm: 'h-10 sm:h-12',
    md: 'h-14 sm:h-16',
    lg: 'h-24 sm:h-28',
  };

  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src="/logo.png"
        alt="SMRITI - Beyond Memoria, Belonging."
        className={`${heights[size]} w-auto object-contain rounded-xl shadow-md transition-transform hover:scale-105`}
      />
    </div>
  );
};
