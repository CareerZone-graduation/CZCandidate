import apiClient from './apiClient';

/**
 * Get credit transaction history with filters and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20, max: 100)
 * @param {string} params.type - Transaction type filter ('DEPOSIT' | 'USAGE')
 * @param {string} params.category - Category filter (e.g., 'RECHARGE', 'JOB_VIEW', 'CV_UNLOCK')
 * @param {string} params.startDate - Start date filter (ISO 8601 format)
 * @param {string} params.endDate - End date filter (ISO 8601 format)
 * @returns {Promise<Object>} Response with transactions, pagination, and summary
 */
export const getCreditHistory = async (params = {}) => {
  try {
    const response = await apiClient.get('/credit-history', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching credit history:', error);
    throw error;
  }
};

/**
 * Get credit transaction summary statistics
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date for summary (ISO 8601 format)
 * @param {string} params.endDate - End date for summary (ISO 8601 format)
 * @returns {Promise<Object>} Response with current balance, totals, and category breakdown
 */
export const getCreditSummary = async (params = {}) => {
  try {
    const response = await apiClient.get('/credit-history/summary', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching credit summary:', error);
    throw error;
  }
};
