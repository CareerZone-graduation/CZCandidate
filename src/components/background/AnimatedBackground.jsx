import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAnimatedBackground } from './useAnimatedBackground';
import GradientOverlay from './GradientOverlay';
import { useBackground } from '@/contexts/BackgroundContext';

/**
 * AnimatedBackground component - Main orchestrator for the background system
 */
const AnimatedBackground = ({
  className,
  children
}) => {
  const [theme, setTheme] = useState('light');
  const { config, updatePerformance } = useBackground();

  // Detect theme changes
  useEffect(() => {
    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    // Initial detection
    detectTheme();

    // Watch for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const {
    canvasRef,
    isAnimating,
    performance,
    updateConfig
  } = useAnimatedBackground({
    particleDensity: config.particleDensity,
    animationSpeed: config.animationSpeed,
    gradientIntensity: config.gradientIntensity,
    theme,
    respectReducedMotion: true
  });

  // Update performance in context
  useEffect(() => {
    if (updatePerformance && performance) {
      updatePerformance(performance);
    }
  }, [performance.fps, performance.particleCount, performance.averageFPS]);

  // Update config when context config changes
  useEffect(() => {
    if (updateConfig) {
      updateConfig({
        density: config.particleDensity,
        speed: config.animationSpeed,
        gradientIntensity: config.gradientIntensity,
        theme
      });
    }
  }, [config.particleDensity, config.animationSpeed, config.gradientIntensity, theme]);

  // Don't render if disabled
  if (!config.enabled) {
    return children;
  }

  return (
    <div 
      className={cn(
        "fixed inset-0 pointer-events-none z-[-1]",
        "transition-opacity duration-1000",
        className
      )}
      aria-hidden="true"
    >
      {/* Gradient Layer */}
      <GradientOverlay 
        intensity={config.gradientIntensity}
        theme={theme}
        className="opacity-80"
      />
      
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 w-full h-full",
          "opacity-60 transition-opacity duration-500",
          isAnimating ? "opacity-60" : "opacity-30"
        )}
        style={{
          width: '100vw',
          height: '100vh'
        }}
      />

      {children}
    </div>
  );
};

export default AnimatedBackground;