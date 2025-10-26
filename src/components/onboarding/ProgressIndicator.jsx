import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  stepLabels = [],
  completedSteps = [] 
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber) || stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    isCompleted && 'bg-emerald-600 text-white',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    isUpcoming && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                {stepLabels[index] && (
                  <p
                    className={cn(
                      'text-xs mt-2 text-center max-w-[100px] transition-colors',
                      isCurrent && 'text-primary font-semibold',
                      isCompleted && 'text-emerald-600',
                      isUpcoming && 'text-muted-foreground'
                    )}
                  >
                    {stepLabels[index]}
                  </p>
                )}
              </div>

              {/* Connector line */}
              {stepNumber < totalSteps && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2 transition-colors',
                    isCompleted ? 'bg-emerald-600' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
