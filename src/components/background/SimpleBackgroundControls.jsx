import React from 'react';
import { useBackground } from '@/contexts/BackgroundContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Simple Background Controls for testing enhanced effects
 */
const SimpleBackgroundControls = () => {
  const { config, updateConfig } = useBackground();

  const densityOptions = [
    { value: 'low', label: 'Low', description: 'Fewer particles' },
    { value: 'medium', label: 'Medium', description: 'Balanced particles' },
    { value: 'high', label: 'High', description: 'More particles' }
  ];

  const speedOptions = [
    { value: 'slow', label: 'Slow', description: 'Gentle movement' },
    { value: 'normal', label: 'Normal', description: 'Standard speed' },
    { value: 'fast', label: 'Fast', description: 'Active movement' }
  ];

  const gradientOptions = [
    { value: 'subtle', label: 'Subtle', description: 'Light gradients' },
    { value: 'medium', label: 'Medium', description: 'Balanced gradients' },
    { value: 'strong', label: 'Strong', description: 'Prominent gradients' }
  ];

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-background/95 backdrop-blur-sm border shadow-lg z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Background Effects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Effects</span>
          <Button
            variant={config.enabled ? "default" : "secondary"}
            size="sm"
            onClick={() => updateConfig({ enabled: !config.enabled })}
          >
            {config.enabled ? 'Enabled' : 'Disabled'}
          </Button>
        </div>

        {config.enabled && (
          <>
            {/* Particle Density */}
            <div>
              <label className="font-medium mb-2 block">Particle Density</label>
              <div className="grid grid-cols-3 gap-1">
                {densityOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={config.particleDensity === option.value ? "default" : "outline"}
                    size="sm"
                    className="text-xs p-1 h-8"
                    onClick={() => updateConfig({ particleDensity: option.value })}
                    title={option.description}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Animation Speed */}
            <div>
              <label className="font-medium mb-2 block">Animation Speed</label>
              <div className="grid grid-cols-3 gap-1">
                {speedOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={config.animationSpeed === option.value ? "default" : "outline"}
                    size="sm"
                    className="text-xs p-1 h-8"
                    onClick={() => updateConfig({ animationSpeed: option.value })}
                    title={option.description}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Gradient Intensity */}
            <div>
              <label className="font-medium mb-2 block">Gradient Intensity</label>
              <div className="grid grid-cols-3 gap-1">
                {gradientOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={config.gradientIntensity === option.value ? "default" : "outline"}
                    size="sm"
                    className="text-xs p-1 h-8"
                    onClick={() => updateConfig({ gradientIntensity: option.value })}
                    title={option.description}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Current Settings Summary */}
            <div className="pt-2 border-t">
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {config.particleDensity} density
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {config.animationSpeed} speed
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {config.gradientIntensity} gradient
                </Badge>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleBackgroundControls;