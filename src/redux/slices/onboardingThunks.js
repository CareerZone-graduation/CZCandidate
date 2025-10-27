import { createAsyncThunk } from '@reduxjs/toolkit';
import { getOnboardingStatus as getOnboardingStatusAPI } from '@/services/onboardingService';
import { setOnboardingStatus, setLoading, setError } from './onboardingSlice';

/**
 * Fetch onboarding status from API and cache in Redux
 */
export const fetchOnboardingStatus = createAsyncThunk(
  'onboarding/fetchStatus',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await getOnboardingStatusAPI();
      
      if (response.success && response.data) {
        // Transform API response to Redux state format
        const statusData = {
          isCompleted: !response.data.needsOnboarding,
          currentStep: response.data.currentStep || 0,
          completedSteps: response.data.completedSteps || [],
          skippedSteps: response.data.skippedSteps || [],
          completionPercentage: response.data.completionPercentage || 0,
          profileCompleteness: response.data.profileCompleteness || {
            hasBasicInfo: false,
            hasExperience: false,
            hasEducation: false,
            hasSkills: false,
            hasCV: false,
            percentage: 0
          }
        };
        
        dispatch(setOnboardingStatus(statusData));
        dispatch(setLoading(false));
        return statusData;
      }
      
      throw new Error('Invalid response from API');
    } catch (error) {
      dispatch(setError(error.message || 'Failed to fetch onboarding status'));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Selector to check if onboarding data needs refresh
 * Returns true if data is stale (older than 5 minutes)
 */
export const shouldRefetchOnboardingStatus = (state) => {
  const lastFetch = state.onboarding.lastFetchTime;
  if (!lastFetch) return true;
  
  const FIVE_MINUTES = 5 * 60 * 1000;
  return Date.now() - lastFetch > FIVE_MINUTES;
};
