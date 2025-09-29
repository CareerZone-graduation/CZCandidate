import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import GradientOverlay from './GradientOverlay';
import { useBackground } from '@/contexts/BackgroundContext';

/**
 * Simplified AnimatedBackground component to avoid infinite loops
 */
const SimpleAnimatedBackground = ({ className, children }) => {
  const [theme, setTheme] = useState('light');
  const { config } = useBackground();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  // Detect theme changes
  useEffect(() => {
    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    detectTheme();
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Static noise texture system
  useEffect(() => {
    if (!config.enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();

    // Create static noise texture
    const createNoiseTexture = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      
      // Noise density based on config
      const density = config.particleDensity === 'low' ? 0.15 : 
                     config.particleDensity === 'high' ? 0.35 : 0.25;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random();
        
        if (noise < density) {
          // Create subtle noise variations
          const intensity = Math.random() * 0.1 + 0.05; // Very subtle intensity
          const grayValue = theme === 'dark' 
            ? Math.random() * 20 + 200  // Light noise on dark background
            : Math.random() * 15 + 100; // Dark noise on light background
          
          data[i] = grayValue;     // Red
          data[i + 1] = grayValue; // Green  
          data[i + 2] = grayValue; // Blue
          data[i + 3] = intensity * 255; // Alpha
        } else {
          // Transparent pixels
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 0;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    };

    createNoiseTexture();

    // Handle resize
    const handleResize = () => {
      resizeCanvas();
      createNoiseTexture();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [config.enabled, config.particleDensity, theme]);

  // Don't render if disabled
  if (!config.enabled) {
    return children;
  }

  return (
    <div 
      className={cn(
        "fixed inset-0 pointer-events-none z-[-1]",
        "transition-opacity duration-1000",
        // Simple gray background instead of gradient
        theme === 'dark' ? "bg-gray-800" : "bg-gray-100",
        className
      )}
      aria-hidden="true"
    >
      {/* Static Noise Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-40" // Subtle noise overlay
        style={{
          width: '100vw',
          height: '100vh'
        }}
      />

      {children}
    </div>
  );
};

export default SimpleAnimatedBackground;