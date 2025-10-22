import React from 'react';
import { cn } from '@/lib/utils';

/**
 * GradientOverlay component renders subtle gradient effects
 */
const GradientOverlay = ({ 
  intensity = 'subtle', 
  className,
  theme = 'light'
}) => {
  const intensityValues = {
    subtle: 0.01,
    medium: 0.02,
    strong: 0.04
  };

  const currentIntensity = intensityValues[intensity] || intensityValues.subtle;

  // Theme-aware gradient colors with enhanced visibility
  const gradientColors = theme === 'dark' 
    ? {
        primary: `rgba(156, 163, 175, ${currentIntensity})`,      // gray-400 (lighter)
        secondary: `rgba(107, 114, 128, ${currentIntensity})`,    // gray-500
        tertiary: `rgba(75, 85, 99, ${currentIntensity * 0.7})`,  // gray-600
        accent1: `rgba(147, 197, 253, ${currentIntensity * 0.5})`, // blue-300 (lighter)
        accent2: `rgba(110, 231, 183, ${currentIntensity * 0.4})`  // emerald-300 (lighter)
      }
    : {
        primary: `rgba(209, 213, 219, ${currentIntensity})`,      // gray-300 (lighter)
        secondary: `rgba(156, 163, 175, ${currentIntensity})`,    // gray-400 (lighter)
        tertiary: `rgba(107, 114, 128, ${currentIntensity * 0.7})`, // gray-500
        accent1: `rgba(96, 165, 250, ${currentIntensity * 0.5})`, // blue-400
        accent2: `rgba(52, 211, 153, ${currentIntensity * 0.4})`  // emerald-400
      };

  const gradientStyle = {
    background: `
      radial-gradient(circle at 20% 30%, ${gradientColors.primary} 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, ${gradientColors.secondary} 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, ${gradientColors.tertiary} 0%, transparent 50%),
      radial-gradient(circle at 60% 20%, ${gradientColors.primary} 0%, transparent 40%),
      radial-gradient(circle at 10% 90%, ${gradientColors.secondary} 0%, transparent 45%),
      radial-gradient(circle at 75% 15%, ${gradientColors.accent1} 0%, transparent 35%),
      radial-gradient(circle at 25% 65%, ${gradientColors.accent2} 0%, transparent 40%),
      radial-gradient(circle at 90% 45%, ${gradientColors.tertiary} 0%, transparent 30%),
      radial-gradient(circle at 5% 55%, ${gradientColors.primary} 0%, transparent 35%),
      radial-gradient(circle at 65% 85%, ${gradientColors.accent1} 0%, transparent 25%)
    `
  };

  return (
    <div 
      className={cn(
        "absolute inset-0 pointer-events-none transition-opacity duration-1000",
        className
      )}
      style={gradientStyle}
      aria-hidden="true"
    />
  );
};

export default GradientOverlay;