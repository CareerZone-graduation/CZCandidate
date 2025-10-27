import { OnboardingWrapper } from '@/components/onboarding';
import { BasicInfoStep } from '@/components/onboarding/steps/BasicInfoStep';
import { SkillsStep } from '@/components/onboarding/steps/SkillsStep';
import { SalaryPreferencesStep } from '@/components/onboarding/steps/SalaryPreferencesStep';
import { ExperienceEducationStep } from '@/components/onboarding/steps/ExperienceEducationStep';
import { CertificatesProjectsStep } from '@/components/onboarding/steps/CertificatesProjectsStep';

const OnboardingPage = () => {
  const handleComplete = () => {
    // This will be handled by OnboardingWrapper
    console.log('Onboarding completed');
  };

  return (
    <OnboardingWrapper onComplete={handleComplete}>
      {({ currentStep, stepData, onNext, isLoading, onLoadingChange }) => {
        switch (currentStep) {
          case 1:
            return (
              <BasicInfoStep
                initialData={stepData}
                onNext={onNext}
                isLoading={isLoading}
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
      }}
    </OnboardingWrapper>
  );
};

export default OnboardingPage;
