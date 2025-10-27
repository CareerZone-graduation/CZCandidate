import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, X } from 'lucide-react';
import { updateProfileData, dismissOnboarding, completeOnboarding } from '@/services/onboardingService';
import { useFormSubmitWithRetry } from '@/hooks/useFormSubmitWithRetry';
import { InlineErrorAlert } from '@/components/common/FallbackUI';
import { getErrorMessage, getErrorType, ErrorType } from '@/utils/errorHandling';
import { OnboardingBackground } from './OnboardingBackground';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { fetchOnboardingStatus } from '@/redux/slices/onboardingThunks';

const ONBOARDING_STORAGE_KEY = 'careerzone_onboarding_progress';

const STEPS = [
  { id: 1, name: 'Thông tin cơ bản', component: 'BasicInfoStep' },
  { id: 2, name: 'Kỹ năng & Kinh nghiệm', component: 'SkillsExperienceStep' },
  { id: 3, name: 'Mức lương & Điều kiện', component: 'SalaryPreferencesStep' }
];

export const OnboardingWrapper = ({ children, onComplete }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isStepLoading, setIsStepLoading] = useState(false);
  const [, forceUpdate] = useState({});

  // Use Redux hook for onboarding status (cached)
  const { 
    profileCompleteness, 
    error: statusError, 
    refresh: refetchStatus 
  } = useOnboardingStatus();
  
  // Create a compatible onboardingStatus object for existing code
  const onboardingStatus = {
    data: {
      profileCompleteness
    }
  };

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
      setSubmitError(null);
      // Refresh Redux state để cập nhật completeness
      dispatch(fetchOnboardingStatus());
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
      // Refresh Redux state
      dispatch(fetchOnboardingStatus());
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
        // Refresh Redux state
        dispatch(fetchOnboardingStatus());
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
        // Refresh Redux state
        dispatch(fetchOnboardingStatus());
        toast.success('Hoàn thành! Bạn có thể cập nhật hồ sơ bất cứ lúc nào');
        onComplete?.();
        navigate('/dashboard');
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
      // Refresh Redux state
      dispatch(fetchOnboardingStatus());
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
  const isLoading = updateProfileMutation.isPending || dismissMutation.isPending || isStepLoading;

  const currentStepInfo = STEPS[currentStep - 1];

  const handleStepLoadingChange = (loading) => {
    console.log('🔔 OnboardingWrapper: handleStepLoadingChange called with:', loading);
    setIsStepLoading(loading);
    // Force re-render to ensure button updates
    forceUpdate({});
    console.log('🔔 OnboardingWrapper: isStepLoading set to:', loading);
  };

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 State Update:', {
      isStepLoading,
      updateProfilePending: updateProfileMutation.isPending,
      dismissPending: dismissMutation.isPending,
      isLoading
    });
  }, [isStepLoading, updateProfileMutation.isPending, dismissMutation.isPending, isLoading]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Animated Background */}
      <OnboardingBackground />

      {/* Backdrop - Blurred background */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleSkipAll}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-card rounded-2xl shadow-2xl border border-border/50 animate-in zoom-in-95 duration-300">

        {/* Global Error Display */}
        {(submitError || statusError) && (
          <div className="absolute top-0 left-0 right-0 z-10 rounded-t-2xl overflow-hidden">
            <InlineErrorAlert
              message={submitError || getErrorMessage(statusError, 'Tải trạng thái onboarding')}
              onRetry={handleRetryError}
              onDismiss={() => setSubmitError(null)}
            />
          </div>
        )}

        {/* Header with progress */}
        <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-border/50">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{currentStep}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {currentStepInfo.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Bước {currentStep} / {STEPS.length}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkipAll}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground hover:bg-destructive/10 rounded-full"
              title="Đóng và bỏ qua"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress bar with step indicators */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex-1 relative">
                    <div className={`h-2 rounded-full transition-all duration-500 ${step.id < currentStep
                        ? 'bg-emerald-500'
                        : step.id === currentStep
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}>
                      {step.id === currentStep && (
                        <div className="absolute inset-0 bg-primary rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="w-2" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`flex-1 text-center text-xs font-medium transition-colors duration-300 ${step.id === currentStep
                      ? 'text-primary'
                      : step.id < currentStep
                        ? 'text-emerald-600'
                        : 'text-muted-foreground'
                    }`}
                >
                  {step.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="animate-in slide-in-from-right-5 duration-300">
            {children({
              currentStep,
              stepData: stepData[currentStep] || {},
              onNext: handleNext,
              isLoading,
              error: submitError,
              onLoadingChange: handleStepLoadingChange
            })}
          </div>
        </div>

        {/* Footer navigation */}
        <div className="flex-shrink-0 px-8 py-6 border-t border-border/50 bg-muted/30">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Back button */}
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isLoading || isFirstStep}
              className="min-w-[120px]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Quay lại
            </Button>

            {/* Right: Skip and Continue buttons */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleSkipStep}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground"
              >
                Bỏ qua bước này
              </Button>
              <Button
                onClick={() => {
                  // Trigger form submission in child component
                  const form = document.querySelector('form');
                  if (form) {
                    form.requestSubmit();
                  }
                }}
                disabled={isLoading}
                className="min-w-[140px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isStepLoading ? 'Đang tải ảnh...' : 'Đang xử lý...'}
                  </span>
                ) : currentStep === STEPS.length ? (
                  'Hoàn thành'
                ) : (
                  'Tiếp tục'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </div>
  );
};
