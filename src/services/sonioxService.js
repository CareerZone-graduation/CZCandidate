import apiClient from './apiClient';

/**
 * Get temporary Soniox API key from backend
 * @returns {Promise<{apiKey: string, expiresAt: string}>}
 */
export const getTemporarySonioxApiKey = async () => {
  const { data } = await apiClient.get('/soniox/temporary-api-key');
  return data.data; // { apiKey, expiresAt }
};

/**
 * Refresh Soniox API key if expired or about to expire
 * @param {string} currentExpiresAt - Current expiration time
 * @returns {Promise<{apiKey: string, expiresAt: string} | null>}
 */
export const refreshSonioxApiKeyIfNeeded = async (currentExpiresAt) => {
  if (!currentExpiresAt) {
    return await getTemporarySonioxApiKey();
  }

  const expiresAt = new Date(currentExpiresAt);
  const now = new Date();
  const timeUntilExpiry = expiresAt - now;
  
  // Refresh if less than 5 minutes until expiry
  if (timeUntilExpiry < 5 * 60 * 1000) {
    return await getTemporarySonioxApiKey();
  }

  return null; // No refresh needed
};
