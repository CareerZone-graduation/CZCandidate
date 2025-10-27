import apiClient from './apiClient';

/**
 * Generate job recommendations for the authenticated candidate
 * @param {Object} options - Generation options (maxDistance, limit)
 * @returns {Promise<Object>} Generated recommendations
 */
export const generateRecommendations = async (options = {}) => {
  const response = await apiClient.post('/candidate/recommendations/generate', options);
  return response.data;
};

/**
 * Get job recommendations with pagination
 * @param {Object} params - Query parameters (page, limit, refresh)
 * @returns {Promise<Object>} Paginated recommendations
 */
export const getRecommendations = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.refresh !== undefined) queryParams.append('refresh', params.refresh);
  
  const url = `/candidate/recommendations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Refresh recommendations (regenerate based on current profile)
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Refreshed recommendations
 */
export const refreshRecommendations = async (options = {}) => {
  return getRecommendations({ ...options, refresh: true });
};
