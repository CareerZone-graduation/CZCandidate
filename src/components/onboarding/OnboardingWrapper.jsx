import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ChevronLeft, X, LogOut } from 'lucide-react';
import { updateProfileData, dismissOnboarding, completeOnboarding } from '@/services/onboardingService';
import { logout } from '@/services/authService';
import { logoutSuccess } from '@/redux/authSlice';
import { InlineErrorAlert } from '@/components/common/FallbackUI';
import { getErrorMessage } from '@/utils/errorHandling';
import { OnboardingBackground } from './OnboardingBackground';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { fetchOnboardingStatus } from '@/redux/slices/onboardingThunks';
import { nextStep, previousStep, setCurrentStep } from '@/redux/slices/onboardingSlice';

const ONBOARDING_STORAGE_KEY = 'careerzone_onboarding_progress';

const STEPS = [
  { id: 1, name: 'Thông tin cơ bản', component: 'BasicInfoStep' },
  { id: 2, name: 'Kỹ năng', component: 'SkillsStep' },
  { id: 3, name: 'Mức lương & Điều kiện', component: 'SalaryPreferencesStep' },
  { id: 4, name: 'Kinh nghiệm & Học vấn', component: 'ExperienceEducationStep' },
  { id: 5, name: 'Chứng chỉ & Dự án', component: 'CertificatesProjectsStep' }
];

export const OnboardingWrapper = ({ children, onComplete }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [stepData, setStepData] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isStepLoading, setIsStepLoading] = useState(false);

  // Sử dụng ref để track lần cuối save localStorage (tránh save quá nhiều)
  const lastSaveTimeRef = useRef(0);
  const saveTimeoutRef = useRef(null);

  // Sử dụng ref để store stepData - tránh stale closure trong callback
  const stepDataRef = useRef(stepData);
  useEffect(() => {
    stepDataRef.current = stepData;
  }, [stepData]);

  // Use Redux hook for onboarding status (cached) - CHỈ lấy lần đầu để init
  const {
    currentStep: reduxCurrentStep,
  } = useOnboardingStatus();

  // Khởi tạo localCurrentStep từ localStorage hoặc Redux hoặc default = 1
  const getInitialStep = () => {
    try {
      const savedProgress = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (savedProgress) {
        const { step } = JSON.parse(savedProgress);
        return step || 1;
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    }
    return reduxCurrentStep > 0 ? reduxCurrentStep : 1;
  };

  // Sử dụng local state cho currentStep để tránh re-render khi Redux thay đổi
  const [localCurrentStep, setLocalCurrentStep] = useState(getInitialStep);

  // Load saved progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (savedProgress) {
      try {
        const { step, data } = JSON.parse(savedProgress);
        if (step && step !== localCurrentStep) {
          setLocalCurrentStep(step);
        }
        if (data) {
          setStepData(data);
        }
      } catch (error) {
        console.error('Failed to load onboarding progress:', error);
      }
    }
  }, []); // CHỈ chạy 1 lần khi mount

  // Debounced save to localStorage - CHỈ save sau 500ms không có thay đổi
  useEffect(() => {
    // Clear timeout cũ nếu có
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Đặt timeout mới
    saveTimeoutRef.current = setTimeout(() => {
      if (localCurrentStep > 0) {
        const progress = {
          step: localCurrentStep,
          data: stepData,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
        lastSaveTimeRef.current = Date.now();
      }
    }, 500); // Debounce 500ms

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [localCurrentStep, stepData]);

  // Update profile mutation with enhanced error handling
  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => updateProfileData(profileData),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    onSuccess: () => {
      setSubmitError(null);
      // KHÔNG fetch lại onboarding status ở đây để tránh re-render
      // Chỉ fetch khi hoàn thành onboarding hoặc khi cần thiết
    },
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'Lưu tiến trình');
      setSubmitError(errorMsg);
      // Vẫn cho phép chuyển step ngay cả khi lưu thất bại
      toast.error(`${errorMsg}. Bạn có thể tiếp tục và cập nhật lại sau.`);
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

  // Memoize handlers để tránh tái tạo mỗi lần render
  const handleNext = useCallback(async (data) => {
    try {
      setSubmitError(null);

      // Sử dụng functional update để tránh dependency vào stepData
      setStepData(prevStepData => {
        const updatedStepData = { ...prevStepData, [localCurrentStep]: data };
        return updatedStepData;
      });

      // Luôn chuyển step trước, bất kể API có thành công hay không
      if (localCurrentStep < STEPS.length) {
        setLocalCurrentStep(prev => prev + 1);
        // Cập nhật Redux state trong nền (không gây re-render vì dùng local state)
        dispatch(nextStep());
      }

      // Gọi API để lưu dữ liệu (không blocking UI)
      try {
        await updateProfileMutation.mutateAsync(data);
      } catch (apiError) {
        // API lỗi nhưng vẫn cho phép user tiếp tục
        console.warn('API save failed but allowing user to continue:', apiError);
      }

      // Nếu đây là bước cuối cùng (sau khi đã nextStep), hoàn thành onboarding
      if (localCurrentStep + 1 > STEPS.length) {
        try {
          await completeOnboarding();
          localStorage.removeItem(ONBOARDING_STORAGE_KEY);
          dispatch(fetchOnboardingStatus());
          toast.success('Hoàn thành onboarding! 🎉');
          onComplete?.();
          navigate('/dashboard');
        } catch (completeError) {
          console.error('Complete onboarding error:', completeError);
          toast.error('Có lỗi khi hoàn thành onboarding. Vui lòng thử lại.');
        }
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      // Fallback: nếu có lỗi bất ngờ, vẫn cho phép chuyển step
      if (localCurrentStep < STEPS.length) {
        setLocalCurrentStep(prev => prev + 1);
        dispatch(nextStep());
        toast.error('Có lỗi xảy ra nhưng bạn có thể tiếp tục. Vui lòng kiểm tra lại thông tin sau.');
      }
    }
  }, [localCurrentStep, updateProfileMutation, dispatch, onComplete, navigate]);

  const handleBack = useCallback(() => {
    setLocalCurrentStep(prev => Math.max(1, prev - 1));
    dispatch(previousStep());
  }, [dispatch]);

  const handleSkipStep = useCallback(async () => {
    try {
      setSubmitError(null);
      const currentStepInfo = STEPS.find(s => s.id === localCurrentStep);

      if (localCurrentStep < STEPS.length) {
        setLocalCurrentStep(prev => prev + 1);
        dispatch(nextStep());
        if (currentStepInfo) {
          toast.info(`Đã bỏ qua bước "${currentStepInfo.name}"`);
        }
      }

      // Kiểm tra nếu đây là bước cuối cùng (sau khi nextStep)
      if (localCurrentStep + 1 > STEPS.length) {
        try {
          await completeOnboarding();
          localStorage.removeItem(ONBOARDING_STORAGE_KEY);
          dispatch(fetchOnboardingStatus());
          toast.success('Hoàn thành! Bạn có thể cập nhật hồ sơ bất cứ lúc nào');
          onComplete?.();
          navigate('/dashboard');
        } catch (completeError) {
          console.error('Complete onboarding error:', completeError);
          toast.error('Có lỗi khi hoàn thành onboarding. Vui lòng thử lại.');
        }
      }
    } catch (error) {
      console.error('Error in handleSkipStep:', error);
      const errorMsg = getErrorMessage(error, 'Bỏ qua bước');
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    }
  }, [localCurrentStep, dispatch, onComplete, navigate]);

  const handleSkipAll = useCallback(async () => {
    try {
      setSubmitError(null);
      await completeOnboarding();
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      dispatch(fetchOnboardingStatus());
      toast.success('Đã bỏ qua onboarding. Bạn có thể hoàn thiện hồ sơ bất cứ lúc nào từ trang cá nhân!');
      onComplete?.();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error in handleSkipAll:', error);
      const errorMsg = getErrorMessage(error, 'Bỏ qua onboarding');
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    }
  }, [dispatch, onComplete, navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      queryClient.clear();
      dispatch(logoutSuccess());
      navigate('/login');
      toast.success('Đăng xuất thành công');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout on error
      queryClient.clear();
      dispatch(logoutSuccess());
      navigate('/login');
    }
  }, [dispatch, navigate, queryClient]);

  const handleRetryError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const handleStepLoadingChange = useCallback((loading) => {
    setIsStepLoading(loading);
  }, []);

  const isFirstStep = localCurrentStep === 1;
  const isLoading = updateProfileMutation.isPending || dismissMutation.isPending || isStepLoading;

  const currentStepInfo = STEPS.find(s => s.id === localCurrentStep);

  if (!currentStepInfo) {
    // Trạng thái khởi tạo hoặc lỗi, có thể hiển thị loading hoặc lỗi
    return null;
  }

  // Memoize child props để tránh tái tạo object mỗi lần render
  // CHỈ phụ thuộc vào localCurrentStep và các handlers (đã được memoize)
  const childProps = useMemo(() => ({
    currentStep: localCurrentStep,
    stepData: stepDataRef.current[localCurrentStep] || {},
    onNext: handleNext,
    isLoading,
    error: submitError,
    onLoadingChange: handleStepLoadingChange
  }), [localCurrentStep, handleNext, isLoading, submitError, handleStepLoadingChange]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <OnboardingBackground />
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-card rounded-2xl shadow-2xl border border-border/50 animate-in zoom-in-95 duration-300">
        {submitError && (
          <div className="absolute top-0 left-0 right-0 z-10 rounded-t-2xl overflow-hidden">
            <InlineErrorAlert
              message={submitError}
              onRetry={handleRetryError}
              onDismiss={() => setSubmitError(null)}
            />
          </div>
        )}
        <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-border/50">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{localCurrentStep}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {currentStepInfo.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Bước {localCurrentStep} / {STEPS.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground hover:bg-destructive/10"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkipAll}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground hover:bg-destructive/10"
                title="Bỏ qua tất cả và hoàn thành onboarding"
              >
                <X className="w-4 h-4 mr-2" />
                Bỏ qua tất cả
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex-1 relative">
                    <div className={`h-2 rounded-full transition-all duration-500 ${step.id < localCurrentStep
                      ? 'bg-emerald-500'
                      : step.id === localCurrentStep
                        ? 'bg-primary'
                        : 'bg-muted'
                      }`}>
                      {step.id === localCurrentStep && (
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
                  className={`flex-1 text-center text-xs font-medium transition-colors duration-300 ${step.id === localCurrentStep
                    ? 'text-primary'
                    : step.id < localCurrentStep
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground'
                    }`}
                >
                  {step.name}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div
            key={localCurrentStep}
            className="animate-in slide-in-from-right-5 duration-200"
          >
            {children(childProps)}
          </div>
        </div>
        <div className="flex-shrink-0 px-8 py-6 border-t border-border/50 bg-muted/30">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isLoading || isFirstStep}
              className="min-w-[120px]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Quay lại
            </Button>
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
                ) : localCurrentStep >= STEPS.length ? (
                  'Hoàn thành'
                ) : (
                  'Tiếp tục'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
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
