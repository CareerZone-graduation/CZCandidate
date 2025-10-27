import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentStep: 1, // Bắt đầu từ step 1 thay vì 0
  completedSteps: [],
  skippedSteps: [],
  isOnboardingComplete: false,
  completionPercentage: 0,
  profileCompleteness: {
    hasBasicInfo: false,
    hasExperience: false,
    hasEducation: false,
    hasSkills: false,
    hasCV: false,
    percentage: 0
  },
  formData: {
    step1: {}, // Basic info
    step2: {}, // Experience
    step3: {}, // Education
    step4: {}, // Skills
    step5: {}  // CV
  },
  isLoading: false,
  error: null,
  lastFetchTime: null, // Track when data was last fetched
  needsOnboarding: false // Track if user needs onboarding
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    // Set onboarding status from API
    setOnboardingStatus: (state, action) => {
      const { isCompleted, currentStep, completedSteps, skippedSteps, completionPercentage, profileCompleteness } = action.payload;
      state.isOnboardingComplete = isCompleted;
      state.needsOnboarding = !isCompleted;
      state.currentStep = currentStep;
      state.completedSteps = completedSteps;
      state.skippedSteps = skippedSteps;
      state.completionPercentage = completionPercentage;
      state.profileCompleteness = profileCompleteness;
      state.lastFetchTime = Date.now();
      state.error = null;
    },

    // Set current step
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },

    // Go to next step
    nextStep: (state) => {
      // Cho phép tăng lên 6 để handle logic hoàn thành onboarding
      if (state.currentStep <= 5) {
        state.currentStep += 1;
      }
    },

    // Go to previous step
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },

    // Mark step as completed
    completeStep: (state, action) => {
      const step = action.payload;
      if (!state.completedSteps.includes(step)) {
        state.completedSteps.push(step);
      }
      // Remove from skipped if it was there
      state.skippedSteps = state.skippedSteps.filter(s => s !== step);

      // Calculate completion percentage
      const totalSteps = 5;
      state.completionPercentage = Math.round((state.completedSteps.length / totalSteps) * 100);
    },

    // Mark step as skipped
    skipStep: (state, action) => {
      const step = action.payload;
      if (!state.skippedSteps.includes(step)) {
        state.skippedSteps.push(step);
      }
    },

    // Update form data for a specific step
    updateStepFormData: (state, action) => {
      const { step, data } = action.payload;
      state.formData[`step${step}`] = { ...state.formData[`step${step}`], ...data };
    },

    // Clear form data for a specific step
    clearStepFormData: (state, action) => {
      const step = action.payload;
      state.formData[`step${step}`] = {};
    },

    // Complete entire onboarding
    completeOnboarding: (state) => {
      state.isOnboardingComplete = true;
      state.currentStep = 5;
    },

    // Skip entire onboarding
    skipAllOnboarding: (state) => {
      state.isOnboardingComplete = true;
      state.currentStep = 5;
      // Mark all uncompleted steps as skipped
      const allSteps = [1, 2, 3, 4, 5];
      state.skippedSteps = allSteps.filter(step => !state.completedSteps.includes(step));
    },

    // Reset onboarding
    resetOnboarding: (state) => {
      return { ...initialState };
    },

    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Update profile completeness
    updateProfileCompleteness: (state, action) => {
      state.profileCompleteness = action.payload;
    }
  }
});

export const {
  setOnboardingStatus,
  setCurrentStep,
  nextStep,
  previousStep,
  completeStep,
  skipStep,
  updateStepFormData,
  clearStepFormData,
  completeOnboarding,
  skipAllOnboarding,
  resetOnboarding,
  setLoading,
  setError,
  clearError,
  updateProfileCompleteness
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
