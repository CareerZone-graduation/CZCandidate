import { useRef, useEffect, useState, useCallback } from 'react';
import { ParticleSystem } from './ParticleSystem';
import { BackgroundConfig, getResponsiveConfig, shouldRespectReducedMotion } from './backgroundConfig';

/**
 * Custom hook for managing animated background state and lifecycle
 */
export const useAnimatedBackground = (options = {}) => {
  const canvasRef = useRef(null);
  const particleSystemRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [performance, setPerformance] = useState({
    fps: 60,
    particleCount: 0,
    averageFPS: 60
  });
  const [config, setConfig] = useState(() => ({
    density: options.particleDensity || 'medium',
    speed: options.animationSpeed || 'normal',
    gradientIntensity: options.gradientIntensity || 'subtle',
    theme: options.theme || 'light'
  }));

  // Initialize particle system
  const initializeParticleSystem = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const responsiveConfig = getResponsiveConfig();
    const densityValue = BackgroundConfig.particles.density[config.density];
    const speedValue = BackgroundConfig.particles.speed[config.speed];

    const particleOptions = {
      density: densityValue * responsiveConfig.densityMultiplier,
      speed: speedValue,
      maxParticles: responsiveConfig.maxParticles,
      theme: config.theme,
      respectReducedMotion: shouldRespectReducedMotion(),
      adaptiveQuality: BackgroundConfig.performance.adaptiveQuality
    };

    // Clean up existing system
    if (particleSystemRef.current) {
      particleSystemRef.current.destroy();
    }

    // Create new particle system
    particleSystemRef.current = new ParticleSystem(canvas, particleOptions);
    
    return particleSystemRef.current;
  }, [config]);

  // Start animation
  const startAnimation = useCallback(() => {
    if (!particleSystemRef.current) {
      const system = initializeParticleSystem();
      if (!system) return;
    }

    particleSystemRef.current.start();
    setIsAnimating(true);

    // Performance monitoring interval
    const performanceInterval = setInterval(() => {
      if (particleSystemRef.current && isMountedRef.current) {
        const stats = particleSystemRef.current.getPerformanceStats();
        setPerformance(prevStats => {
          // Only update if there's a significant change
          if (
            Math.abs(prevStats.fps - stats.fps) > 2 ||
            Math.abs(prevStats.particleCount - stats.particleCount) > 5 ||
            Math.abs(prevStats.averageFPS - stats.averageFPS) > 2
          ) {
            return stats;
          }
          return prevStats;
        });
      }
    }, BackgroundConfig.performance.performanceCheckInterval);

    return () => clearInterval(performanceInterval);
  }, [initializeParticleSystem]);

  // Stop animation
  const stopAnimation = useCallback(() => {
    if (particleSystemRef.current) {
      particleSystemRef.current.stop();
    }
    setIsAnimating(false);
  }, []);

  // Handle resize with debouncing
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      if (particleSystemRef.current) {
        particleSystemRef.current.resize();
        
        // Reinitialize if screen size category changed significantly
        const newResponsiveConfig = getResponsiveConfig();
        const currentParticleCount = particleSystemRef.current.particles.length;
        const targetParticleCount = Math.min(
          Math.floor(canvasRef.current.width * canvasRef.current.height * 
            BackgroundConfig.particles.density[config.density] * newResponsiveConfig.densityMultiplier),
          newResponsiveConfig.maxParticles
        );

        if (Math.abs(currentParticleCount - targetParticleCount) > targetParticleCount * 0.3) {
          initializeParticleSystem();
          if (isAnimating) {
            startAnimation();
          }
        }
      }
    }, 250);
  }, [config.density, initializeParticleSystem, isAnimating, startAnimation]);

  // Update configuration
  const updateConfig = useCallback((newConfig) => {
    setConfig(prevConfig => {
      const updatedConfig = { ...prevConfig, ...newConfig };
      
      // Update particle system if it exists
      if (particleSystemRef.current) {
        const responsiveConfig = getResponsiveConfig();
        const densityValue = BackgroundConfig.particles.density[updatedConfig.density];
        const speedValue = BackgroundConfig.particles.speed[updatedConfig.speed];

        particleSystemRef.current.updateConfig({
          density: densityValue * responsiveConfig.densityMultiplier,
          speed: speedValue,
          maxParticles: responsiveConfig.maxParticles,
          theme: updatedConfig.theme
        });

        // Update theme if changed
        if (newConfig.theme && newConfig.theme !== prevConfig.theme) {
          particleSystemRef.current.updateTheme(updatedConfig.theme);
        }
      }
      
      return updatedConfig;
    });
  }, []);

  // Handle visibility change (pause when tab is not visible)
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      stopAnimation();
    } else if (canvasRef.current && !shouldRespectReducedMotion()) {
      startAnimation();
    }
  }, [startAnimation, stopAnimation]);

  // Initialize on mount
  useEffect(() => {
    if (canvasRef.current && !shouldRespectReducedMotion()) {
      const cleanup = startAnimation();
      return cleanup;
    }
  }, [startAnimation]);

  // Handle resize events
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize]);

  // Handle visibility change
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleVisibilityChange]);

  // Handle reduced motion preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleMotionPreferenceChange = (e) => {
      if (e.matches) {
        stopAnimation();
      } else if (canvasRef.current) {
        startAnimation();
      }
    };

    mediaQuery.addEventListener('change', handleMotionPreferenceChange);
    return () => mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
  }, [startAnimation, stopAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (particleSystemRef.current) {
        particleSystemRef.current.destroy();
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  return {
    canvasRef,
    isAnimating,
    performance,
    config,
    updateConfig,
    startAnimation,
    stopAnimation
  };
};