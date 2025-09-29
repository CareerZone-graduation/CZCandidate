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
    subtle: 0.02,
    medium: 0.04,
    strong: 0.08          // Updated to match enhanced config
  };

  const currentIntensity = intensityValues[intensity] || intensityValues.subtle;

  // Theme-aware gradient colors with enhanced visibility
  const gradientColors = theme === 'dark' 
    ? {
        primary: `rgba(107, 114, 128, ${currentIntensity})`,     // gray-500
        secondary: `rgba(75, 85, 99, ${currentIntensity})`,       // gray-600
        tertiary: `rgba(55, 65, 81, ${currentIntensity * 0.8})`,  // gray-700
        accent1: `rgba(96, 165, 250, ${currentIntensity * 0.6})`, // blue-400
        accent2: `rgba(52, 211, 153, ${currentIntensity * 0.5})`  // emerald-400
      }
    : {
        primary: `rgba(156, 163, 175, ${currentIntensity})`,      // gray-400
        secondary: `rgba(107, 114, 128, ${currentIntensity})`,     // gray-500
        tertiary: `rgba(75, 85, 99, ${currentIntensity * 0.8})`,  // gray-600
        accent1: `rgba(59, 130, 246, ${currentIntensity * 0.6})`, // blue-500
        accent2: `rgba(16, 185, 129, ${currentIntensity * 0.5})`  // emerald-500
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