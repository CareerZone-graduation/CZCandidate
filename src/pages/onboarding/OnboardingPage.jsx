import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { OnboardingWrapper } from '@/components/onboarding/OnboardingWrapper';
import { BasicInfoStep } from '@/components/onboarding/steps/BasicInfoStep';
import { SkillsExperienceStep } from '@/components/onboarding/steps/SkillsExperienceStep';
import { SalaryPreferencesStep } from '@/components/onboarding/steps/SalaryPreferencesStep';
import { LoadingState } from '@/components/onboarding/LoadingState';
import { ErrorState } from '@/components/onboarding/ErrorState';
import { getOnboardingStatus } from '@/services/onboardingService';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Check onboarding status
  const { data: onboardingStatus, isLoading, error } = useQuery({
    queryKey: ['onboardingStatus'],
    queryFn: getOnboardingStatus,
    enabled: isAuthenticated,
    retry: 1
  });

  // If onboarding is already completed, redirect to dashboard
  useEffect(() => {
    // ✅ FIX: Check if onboarding is NOT needed (completed)
    if (onboardingStatus?.data && !onboardingStatus.data.needsOnboarding) {
      navigate('/dashboard', { replace: true });
    }
  }, [onboardingStatus, navigate]);

  const handleComplete = () => {
    navigate('/dashboard', { replace: true });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Không thể tải trạng thái onboarding"
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Render the appropriate step based on current step
  const renderStep = ({ currentStep, stepData, onNext, isLoading }) => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            initialData={stepData}
            onNext={onNext}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <SkillsExperienceStep
            initialData={stepData}
            onNext={onNext}
            isLoading={isLoading}
          />
        );
      case 3:
        return (
          <SalaryPreferencesStep
            initialData={stepData}
            onNext={onNext}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <OnboardingWrapper onComplete={handleComplete}>
      {renderStep}
    </OnboardingWrapper>
  );
};

export default OnboardingPage;
