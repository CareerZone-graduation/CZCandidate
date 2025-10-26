import { OnboardingWrapper } from '@/components/onboarding';
import { BasicInfoStep } from '@/components/onboarding/steps/BasicInfoStep';
import { SkillsExperienceStep } from '@/components/onboarding/steps/SkillsExperienceStep';
import { SalaryPreferencesStep } from '@/components/onboarding/steps/SalaryPreferencesStep';

const OnboardingPage = () => {
  const handleComplete = () => {
    // This will be handled by OnboardingWrapper
    console.log('Onboarding completed');
  };

  return (
    <OnboardingWrapper onComplete={handleComplete}>
      {({ currentStep, stepData, onNext, isLoading }) => {
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
      }}
    </OnboardingWrapper>
  );
};

export default OnboardingPage;
