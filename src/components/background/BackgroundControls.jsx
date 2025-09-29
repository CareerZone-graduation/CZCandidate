import React, { useState, useEffect } from 'react';
import { Settings, Palette, Activity, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useBackground } from '@/contexts/BackgroundContext';

/**
 * BackgroundControls component for adjusting animated background settings
 */
const BackgroundControls = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { config, updateConfig, resetConfig, toggleEnabled } = useBackground();

  const densityOptions = [
    { value: 'low', label: 'Thấp', description: 'Ít hạt, hiệu suất cao' },
    { value: 'medium', label: 'Trung bình', description: 'Cân bằng tốt' },
    { value: 'high', label: 'Cao', description: 'Nhiều hạt, đẹp mắt' }
  ];

  const speedOptions = [
    { value: 'slow', label: 'Chậm', description: 'Chuyển động nhẹ nhàng' },
    { value: 'normal', label: 'Bình thường', description: 'Tốc độ chuẩn' },
    { value: 'fast', label: 'Nhanh', description: 'Chuyển động năng động' }
  ];

  const intensityOptions = [
    { value: 'subtle', label: 'Tinh tế', description: 'Gradient nhẹ' },
    { value: 'medium', label: 'Trung bình', description: 'Gradient vừa phải' },
    { value: 'strong', label: 'Mạnh', description: 'Gradient rõ nét' }
  ];

  const updateConfigValue = (key, value) => {
    updateConfig({ [key]: value });
  };

  // Check if user prefers reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (prefersReducedMotion) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <EnhancedCard className="w-80">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4" />
              Background Effects
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <p className="text-sm text-muted-foreground">
              Background animations are disabled due to your reduced motion preference.
            </p>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        size="icon"
        className="mb-2 shadow-lg bg-background/80 backdrop-blur-sm border border-border hover:bg-background/90"
        variant="outline"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {/* Controls Panel */}
      {isVisible && (
        <EnhancedCard className="w-80 max-h-[80vh] overflow-y-auto">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Background Settings
            </EnhancedCardTitle>
            <EnhancedCardDescription>
              Customize the animated background effects
            </EnhancedCardDescription>
          </EnhancedCardHeader>
          
          <EnhancedCardContent className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Effects</p>
                <p className="text-sm text-muted-foreground">Turn background animation on/off</p>
              </div>
              <Button
                onClick={toggleEnabled}
                variant={config.enabled ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                {config.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {config.enabled ? 'On' : 'Off'}
              </Button>
            </div>

            {config.enabled && (
              <>
                {/* Particle Density */}
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Particle Density</p>
                    <p className="text-sm text-muted-foreground">Number of animated particles</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {densityOptions.map((option) => (
                      <Button
                        key={option.value}
                        onClick={() => updateConfigValue('particleDensity', option.value)}
                        variant={config.particleDensity === option.value ? "default" : "outline"}
                        size="sm"
                        className="flex flex-col h-auto p-2"
                      >
                        <span className="text-xs font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Animation Speed */}
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Animation Speed</p>
                    <p className="text-sm text-muted-foreground">Speed of particle movement</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {speedOptions.map((option) => (
                      <Button
                        key={option.value}
                        onClick={() => updateConfigValue('animationSpeed', option.value)}
                        variant={config.animationSpeed === option.value ? "default" : "outline"}
                        size="sm"
                        className="flex flex-col h-auto p-2"
                      >
                        <span className="text-xs font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Gradient Intensity */}
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Gradient Intensity</p>
                    <p className="text-sm text-muted-foreground">Strength of background gradients</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {intensityOptions.map((option) => (
                      <Button
                        key={option.value}
                        onClick={() => updateConfigValue('gradientIntensity', option.value)}
                        variant={config.gradientIntensity === option.value ? "default" : "outline"}
                        size="sm"
                        className="flex flex-col h-auto p-2"
                      >
                        <span className="text-xs font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Performance Info */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Performance</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Auto-optimization:</span>
                  <Badge variant="secondary" className="text-xs">Enabled</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Reduced motion:</span>
                  <Badge variant="secondary" className="text-xs">
                    {prefersReducedMotion ? 'Respected' : 'Normal'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <Button
              onClick={resetConfig}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Reset to Default
            </Button>
          </EnhancedCardContent>
        </EnhancedCard>
      )}
    </div>
  );
};

export default BackgroundControls;