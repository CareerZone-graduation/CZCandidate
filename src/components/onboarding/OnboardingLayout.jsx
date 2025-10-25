import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const TOTAL_STEPS = 5;

const STEP_TITLES = {
  1: 'Thông tin cơ bản',
  2: 'Kinh nghiệm làm việc',
  3: 'Học vấn',
  4: 'Kỹ năng',
  5: 'Upload CV'
};

export const OnboardingLayout = ({ 
  children, 
  currentStep, 
  onNext, 
  onBack, 
  onSkip, 
  onSkipAll,
  isLastStep = false,
  isFirstStep = false,
  isLoading = false
}) => {
  const progress = (currentStep / TOTAL_STEPS) * 100;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header with progress */}
      <div className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Hoàn thiện hồ sơ ({currentStep}/{TOTAL_STEPS})
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {STEP_TITLES[currentStep]}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkipAll}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Bỏ qua tất cả
            </Button>
          </div>
          
          {/* Progress bar with step indicators */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {[1, 2, 3, 4, 5].map((step) => (
                <div 
                  key={step} 
                  className={`flex-1 text-center ${
                    step === currentStep ? 'text-primary font-semibold' : ''
                  } ${
                    step < currentStep ? 'text-emerald-600' : ''
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 pb-32">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </div>

      {/* Footer navigation - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg p-4 z-40">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={onSkip}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              Bỏ qua bước này
            </Button>
            
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={onBack}
                  disabled={isLoading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Quay lại
                </Button>
              )}
              <Button 
                onClick={onNext}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  'Đang xử lý...'
                ) : isLastStep ? (
                  'Hoàn thành'
                ) : (
                  <>
                    Tiếp tục
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
