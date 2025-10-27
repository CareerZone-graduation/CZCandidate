import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { OnboardingWrapper } from '@/components/onboarding/OnboardingWrapper';
import { BasicInfoStep } from '@/components/onboarding/steps/BasicInfoStep';
import { SkillsStep } from '@/components/onboarding/steps/SkillsStep';
import { SalaryPreferencesStep } from '@/components/onboarding/steps/SalaryPreferencesStep';
import { ExperienceEducationStep } from '@/components/onboarding/steps/ExperienceEducationStep';
import { CertificatesProjectsStep } from '@/components/onboarding/steps/CertificatesProjectsStep';
import { LoadingState } from '@/components/onboarding/LoadingState';
import { ErrorState } from '@/components/onboarding/ErrorState';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Use Redux hook for onboarding status (cached)
  const { needsOnboarding, isLoading, error } = useOnboardingStatus();

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // If onboarding is already completed, redirect to dashboard
  useEffect(() => {
    if (!isLoading && !needsOnboarding) {
      navigate('/dashboard', { replace: true });
    }
  }, [needsOnboarding, isLoading, navigate]);

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
  const renderStep = ({ currentStep, stepData, onNext, isLoading, error, onLoadingChange }) => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            initialData={stepData}
            onNext={onNext}
            isLoading={isLoading}
            error={error}
            onLoadingChange={onLoadingChange}
          />
        );
      case 2:
        return (
          <SkillsStep
            initialData={stepData}
            onNext={onNext}
            isLoading={isLoading}
            onLoadingChange={onLoadingChange}
          />
        );
      case 3:
        return (
          <SalaryPreferencesStep
            initialData={stepData}
            onNext={onNext}
            isLoading={isLoading}
            onLoadingChange={onLoadingChange}
          />
        );
      case 4:
        return (
          <ExperienceEducationStep
            initialData={stepData}
            onNext={onNext}
            isLoading={isLoading}
            onLoadingChange={onLoadingChange}
          />
        );
      case 5:
        return (
          <CertificatesProjectsStep
            initialData={stepData}
            onNext={onNext}
            isLoading={isLoading}
            onLoadingChange={onLoadingChange}
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
