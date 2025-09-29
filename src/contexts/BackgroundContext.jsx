import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DEFAULT_BACKGROUND_CONFIG, BACKGROUND_CONFIG_DEFAULTS } from './backgroundConfig';

/**
 * Context for managing global animated background state
 */
const BackgroundContext = createContext();

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

export const BackgroundProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('careerzone-background-config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.warn('Failed to parse saved background config:', error);
      }
    }
    
    // Default configuration
    return DEFAULT_BACKGROUND_CONFIG;
  });


  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('careerzone-background-config', JSON.stringify(config));
  }, [config]);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e) => {
      if (e.matches) {
        setConfig(prev => ({ ...prev, enabled: false }));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    // Initial check
    if (mediaQuery.matches) {
      setConfig(prev => ({ ...prev, enabled: false }));
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const updateConfig = useCallback((newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(BACKGROUND_CONFIG_DEFAULTS);
  }, []);

  const toggleEnabled = useCallback(() => {
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const value = useMemo(() => ({
    config,
    updateConfig,
    resetConfig,
    toggleEnabled
  }), [config, updateConfig, resetConfig, toggleEnabled]);

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
};
