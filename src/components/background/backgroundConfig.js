/**
 * Configuration constants for the animated background system
 */

export const BackgroundConfig = {
  particles: {
    density: {
      low: 0.15,           // Static noise density - low
      medium: 0.25,        // Static noise density - medium  
      high: 0.35           // Static noise density - high
    },
    speed: {
      slow: 0,             // No movement for static noise
      normal: 0,           // No movement for static noise
      fast: 0              // No movement for static noise
    },
    size: {
      min: 1,              // Pixel size for noise
      max: 1,              // Single pixel noise
      variance: 0          // No size variation
    },
    opacity: {
      min: 0.05,           // Very subtle noise
      max: 0.15,           // Subtle noise intensity
      decay: {
        min: 0,
        max: 0
      }
    },
    colors: {
      light: [
        'rgba(75, 85, 99, 0.6)',     // Darker gray for better contrast
        'rgba(107, 114, 128, 0.5)',  // Medium gray
        'rgba(156, 163, 175, 0.4)',  // Light gray
        'rgba(59, 130, 246, 0.35)',  // Blue accent
        'rgba(16, 185, 129, 0.3)'    // Green accent
      ],
      dark: [
        'rgba(255, 255, 255, 0.4)',  // Bright white for dark backgrounds
        'rgba(209, 213, 219, 0.5)',  // Light gray-white
        'rgba(156, 163, 175, 0.4)',  // Medium gray
        'rgba(96, 165, 250, 0.3)',   // Blue accent for dark mode
        'rgba(52, 211, 153, 0.25)'   // Green accent for dark mode
      ]
    }
  },
  gradients: {
    intensity: {
      subtle: 0.02,
      medium: 0.04,
      strong: 0.08          // Increased from 0.06 for stronger gradients
    },
    positions: [
      { x: 20, y: 30 },
      { x: 80, y: 70 },
      { x: 40, y: 80 },
      { x: 60, y: 20 },
      { x: 10, y: 90 },
      { x: 75, y: 15 },     // Additional gradient positions
      { x: 25, y: 65 },     // for richer visual effects
      { x: 90, y: 45 },
      { x: 5, y: 55 },
      { x: 65, y: 85 }
    ]
  },
  performance: {
    targetFPS: 60,
    minFPS: 30,
    maxParticles: 300,          // Increased from 200 for more particles
    performanceCheckInterval: 1000, // ms
    adaptiveQuality: true
  },
  responsive: {
    mobile: {
      densityMultiplier: 0.6,     // Increased from 0.5
      maxParticles: 150           // Increased from 100
    },
    tablet: {
      densityMultiplier: 0.85,    // Increased from 0.75
      maxParticles: 200           // Increased from 150
    },
    desktop: {
      densityMultiplier: 1.2,     // Increased from 1 for more dramatic effect
      maxParticles: 300           // Increased from 200
    }
  }
};

export const getResponsiveConfig = () => {
  const width = window.innerWidth;
  
  if (width < 768) {
    return BackgroundConfig.responsive.mobile;
  } else if (width < 1024) {
    return BackgroundConfig.responsive.tablet;
  } else {
    return BackgroundConfig.responsive.desktop;
  }
};

export const shouldRespectReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};