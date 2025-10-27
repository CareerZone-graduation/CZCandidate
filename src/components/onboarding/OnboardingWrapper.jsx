import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, X } from 'lucide-react';
import { getOnboardingStatus, updateProfileData, dismissOnboarding, completeOnboarding } from '@/services/onboardingService';
import { useFormSubmitWithRetry } from '@/hooks/useFormSubmitWithRetry';
import { InlineErrorAlert } from '@/components/common/FallbackUI';
import { getErrorMessage, getErrorType, ErrorType } from '@/utils/errorHandling';

const ONBOARDING_STORAGE_KEY = 'careerzone_onboarding_progress';

const STEPS = [
  { id: 1, name: 'Thông tin cơ bản', component: 'BasicInfoStep' },
  { id: 2, name: 'Kỹ năng & Kinh nghiệm', component: 'SkillsExperienceStep' },
  { id: 3, name: 'Mức lương & Điều kiện', component: 'SalaryPreferencesStep' }
];

export const OnboardingWrapper = ({ children, onComplete }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Load onboarding status from backend with error handling
  const {
    data: onboardingStatus,
    error: statusError,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['onboardingStatus'],
    queryFn: getOnboardingStatus,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  });

  // Load saved progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (savedProgress) {
      try {
        const { step, data } = JSON.parse(savedProgress);
        setCurrentStep(step);
        setStepData(data);
      } catch (error) {
        console.error('Failed to load onboarding progress:', error);
      }
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    const progress = {
      step: currentStep,
      data: stepData,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
  }, [currentStep, stepData]);

  // Update profile mutation with enhanced error handling
  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => updateProfileData(profileData),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    onSuccess: (response) => {
      toast.success('Đã lưu tiến trình');
      setSubmitError(null);
      // Refetch status để cập nhật completeness
      refetchStatus();
    },
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'Lưu tiến trình');
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    }
  });

  // Dismiss onboarding mutation with enhanced error handling
  const dismissMutation = useMutation({
    mutationFn: dismissOnboarding,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    onSuccess: () => {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      toast.info('Bạn có thể hoàn thiện hồ sơ bất cứ lúc nào');
      setSubmitError(null);
      onComplete?.();
      navigate('/dashboard');
    },
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'Bỏ qua onboarding');
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    }
  });

  const handleNext = async (data) => {
    try {
      setSubmitError(null);

      // Save current step data
      const updatedStepData = { ...stepData, [currentStep]: data };
      setStepData(updatedStepData);

      // Update profile với data mới
      await updateProfileMutation.mutateAsync(data);

      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      } else {
        // Last step - Đánh dấu hoàn thành onboarding
        await completeOnboarding();
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
        toast.success('Hoàn thành onboarding! 🎉');
        onComplete?.();
        navigate('/dashboard');
      }
    } catch (error) {
      // Error is already handled by mutation onError
      console.error('Error in handleNext:', error);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipStep = async () => {
    try {
      setSubmitError(null);

      // Skip bước hiện tại, chuyển sang bước tiếp theo
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      } else {
        // Nếu là bước cuối, đánh dấu hoàn thành
        await completeOnboarding();
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
        onComplete?.();
        navigate('/');
      }
    } catch (error) {
      console.error('Error in handleSkipStep:', error);
      const errorMsg = getErrorMessage(error, 'Bỏ qua bước');
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleSkipAll = async () => {
    try {
      setSubmitError(null);

      // Bỏ qua tất cả → Đánh dấu hoàn thành onboarding
      await completeOnboarding();
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      toast.info('Bạn có thể hoàn thiện hồ sơ bất cứ lúc nào');
      onComplete?.();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error in handleSkipAll:', error);
      const errorMsg = getErrorMessage(error, 'Bỏ qua onboarding');
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleRetryError = () => {
    setSubmitError(null);
    if (statusError) {
      refetchStatus();
    }
  };

  const progress = (currentStep / STEPS.length) * 100;
  const isFirstStep = currentStep === 1;
  const isLoading = updateProfileMutation.isPending || dismissMutation.isPending;

  const currentStepInfo = STEPS[currentStep - 1];

  return (
    <div className="min-h-screen bg-background">
      {/* Global Error Display */}
      {(submitError || statusError) && (
        <div className="sticky top-0 z-50">
          <InlineErrorAlert
            message={submitError || getErrorMessage(statusError, 'Tải trạng thái onboarding')}
            onRetry={handleRetryError}
            onDismiss={() => setSubmitError(null)}
          />
        </div>
      )}
      {/* Header with progress */}
      <div className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Hoàn thiện hồ sơ ({currentStep}/{STEPS.length})
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStepInfo.name}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipAll}
              disabled={isLoading}
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
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`flex-1 text-center ${step.id === currentStep ? 'text-primary font-semibold' : ''
                    } ${step.id < currentStep ? 'text-emerald-600' : ''
                    }`}
                >
                  {step.id}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 pb-32">
        <div className="max-w-3xl mx-auto">
          {children({
            currentStep,
            stepData: stepData[currentStep] || {},
            onNext: handleNext,
            isLoading,
            error: submitError
          })}
        </div>
      </div>

      {/* Footer navigation - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t shadow-lg z-40">
        <div className="container mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Back button */}
            <div className="flex-shrink-0">
              {!isFirstStep ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Quay lại
                </Button>
              ) : (
                <div className="w-[100px]"></div>
              )}
            </div>

            {/* Center: Step indicator */}
            <div className="text-sm text-muted-foreground font-medium">
              Bước {currentStep}/{STEPS.length}
            </div>

            {/* Right: Skip button */}
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                onClick={handleSkipStep}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground"
              >
                Bỏ qua
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
