import apiClient from './apiClient';

/**
 * Get my applications
 */
export const getMyApplications = async (params) => {
  const response = await apiClient.get('/applications/my', { params });
  return response.data;
};

/**
 * Get application detail
 */
export const getApplicationDetail = async (applicationId) => {
  const response = await apiClient.get(`/candidate/my-applications/${applicationId}`);
  return response.data;
};

/**
 * Score CV for an application
 */
export const scoreCVForApplication = async (applicationId) => {
  const response = await apiClient.post(`/applications/${applicationId}/score-cv`);
  return response.data;
};

/**
 * Generate improved CV
 */
export const generateImprovedCV = async (applicationId) => {
  const response = await apiClient.post(`/applications/${applicationId}/generate-cv`);
  return response.data;
};
