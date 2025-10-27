import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOnboardingStatus, shouldRefetchOnboardingStatus } from '@/redux/slices/onboardingThunks';

/**
 * Custom hook to get onboarding status from Redux
 * Automatically fetches from API if data is stale or missing
 * 
 * @param {boolean} autoFetch - Whether to automatically fetch on mount (default: true)
 * @returns {Object} Onboarding status and helper functions
 */
export const useOnboardingStatus = (autoFetch = true) => {
  const dispatch = useDispatch();
  
  const {
    isOnboardingComplete,
    needsOnboarding,
    currentStep,
    completedSteps,
    skippedSteps,
    completionPercentage,
    profileCompleteness,
    isLoading,
    error,
    lastFetchTime
  } = useSelector((state) => state.onboarding);

  const shouldRefetch = useSelector(shouldRefetchOnboardingStatus);

  // Auto-fetch on mount if enabled and data is stale
  useEffect(() => {
    if (autoFetch && shouldRefetch) {
      dispatch(fetchOnboardingStatus());
    }
  }, [autoFetch, shouldRefetch, dispatch]);

  // Manual refresh function
  const refresh = () => {
    dispatch(fetchOnboardingStatus());
  };

  return {
    // Status flags
    isOnboardingComplete,
    needsOnboarding,
    
    // Progress data
    currentStep,
    completedSteps,
    skippedSteps,
    completionPercentage,
    profileCompleteness,
    
    // Loading states
    isLoading,
    error,
    lastFetchTime,
    
    // Actions
    refresh
  };
};
