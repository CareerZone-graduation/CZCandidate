import api from './api';

/**
 * Get onboarding status
 * GET /api/candidate/onboarding/status
 */
export const getOnboardingStatus = () => {
  return api.get('/candidate/onboarding/status');
};

/**
 * Update onboarding step
 * PATCH /api/candidate/onboarding/step
 * @param {Object} stepData - { currentStep, completedStep, skipped }
 */
export const updateOnboardingStep = (stepData) => {
  return api.patch('/candidate/onboarding/step', stepData);
};

/**
 * Skip entire onboarding
 * PATCH /api/candidate/onboarding/skip
 */
export const skipOnboarding = () => {
  return api.patch('/candidate/onboarding/skip');
};

/**
 * Complete onboarding
 * POST /api/candidate/onboarding/complete
 */
export const completeOnboarding = () => {
  return api.post('/candidate/onboarding/complete');
};
