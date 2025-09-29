/**
 * Animated Background System - Export Index
 * 
 * This file exports all components and utilities related to the animated background system.
 * The system provides noise particle animations with subtle gradients that integrate
 * seamlessly with the existing UI components.
 */

// Core Components
export { default as AnimatedBackground } from './AnimatedBackground';
export { default as GradientOverlay } from './GradientOverlay';
export { ParticleSystem } from './ParticleSystem';

// UI Controls
export { default as BackgroundControls } from './BackgroundControls';
export { default as PerformanceMonitor } from './PerformanceMonitor';

// Hooks and Utilities
export { useAnimatedBackground } from './useAnimatedBackground';
export { BackgroundConfig, getResponsiveConfig, shouldRespectReducedMotion } from './backgroundConfig';

// Context
export { BackgroundProvider, useBackground } from '../../contexts/BackgroundContext';

/**
 * Usage Examples:
 * 
 * 1. Basic Setup:
 * ```jsx
 * import { BackgroundProvider, AnimatedBackground } from '@/components/background';
 * 
 * function App() {
 *   return (
 *     <BackgroundProvider>
 *       <AnimatedBackground />
 *       <YourAppContent />
 *     </BackgroundProvider>
 *   );
 * }
 * ```
 * 
 * 2. With Controls (Development):
 * ```jsx
 * import { BackgroundControls, PerformanceMonitor } from '@/components/background';
 * 
 * function App() {
 *   return (
 *     <>
 *       <AnimatedBackground />
 *       {process.env.NODE_ENV === 'development' && (
 *         <>
 *           <BackgroundControls />
 *           <PerformanceMonitor />
 *         </>
 *       )}
 *     </>
 *   );
 * }
 * ```
 * 
 * 3. Custom Configuration:
 * ```jsx
 * import { useBackground } from '@/components/background';
 * 
 * function CustomComponent() {
 *   const { config, updateConfig } = useBackground();
 *   
 *   const handleConfigChange = () => {
 *     updateConfig({
 *       particleDensity: 'high',
 *       animationSpeed: 'fast'
 *     });
 *   };
 * }
 * ```
 */