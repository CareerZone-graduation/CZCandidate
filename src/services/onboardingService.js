import apiClient from './apiClient';
import { logError } from '@/utils/errorHandling';

/**
 * Get onboarding status - Kiểm tra profile completeness
 * GET /api/candidate/onboarding/status
 */
export const getOnboardingStatus = async () => {
  try {
    const response = await apiClient.get('/candidate/onboarding/status');
    return response.data;
  } catch (error) {
    logError(error, { context: 'getOnboardingStatus' });
    throw error;
  }
};

/**
 * Get profile improvement recommendations
 * GET /api/candidate/onboarding/recommendations
 */
export const getRecommendations = async () => {
  try {
    const response = await apiClient.get('/candidate/onboarding/recommendations');
    return response.data;
  } catch (error) {
    logError(error, { context: 'getRecommendations' });
    throw error;
  }
};

/**
 * Update profile data - Không cần step ID
 * PUT /api/candidate/onboarding/update
 * @param {Object} profileData - Profile data to update
 */
export const updateProfileData = async (profileData) => {
  try {
    if (!profileData || typeof profileData !== 'object') {
      throw new Error('Invalid profile data');
    }

    const response = await apiClient.put('/candidate/onboarding/update', {
      profileData
    });
    return response.data;
  } catch (error) {
    logError(error, {
      context: 'updateProfileData',
      profileData
    });
    throw error;
  }
};

/**
 * Upload avatar
 * POST /api/candidate/onboarding/upload-avatar
 * @param {File} file - Avatar file
 */
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post('/candidate/onboarding/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    logError(error, { context: 'uploadAvatar' });
    throw error;
  }
};

/**
 * Dismiss onboarding reminder - Tạm thời bỏ qua
 * POST /api/candidate/onboarding/dismiss
 */
export const dismissOnboarding = async () => {
  try {
    const response = await apiClient.post('/candidate/onboarding/dismiss');
    return response.data;
  } catch (error) {
    logError(error, { context: 'dismissOnboarding' });
    throw error;
  }
};

// ===== DEPRECATED - Giữ lại để backward compatibility =====

/**
 * @deprecated Use updateProfileData instead
 */
export const updateOnboardingStep = async (stepId, stepData, completed = false) => {
  console.warn('updateOnboardingStep is deprecated. Use updateProfileData instead.');
  return updateProfileData(stepData);
};

/**
 * @deprecated Use dismissOnboarding instead
 */
export const skipOnboardingStep = async (stepId, reason = null) => {
  console.warn('skipOnboardingStep is deprecated. Use dismissOnboarding instead.');
  return dismissOnboarding();
};

/**
 * @deprecated No longer needed - profile completeness is checked automatically
 */
export const startOnboarding = async () => {
  console.warn('startOnboarding is deprecated. Profile completeness is checked automatically on login.');
  return getOnboardingStatus();
};

/**
 * Complete onboarding - Đánh dấu user đã hoàn thành onboarding
 * POST /api/candidate/onboarding/complete
 */
export const completeOnboarding = async () => {
  try {
    const response = await apiClient.post('/candidate/onboarding/complete');
    return response.data;
  } catch (error) {
    logError(error, { context: 'completeOnboarding' });
    throw error;
  }
};
