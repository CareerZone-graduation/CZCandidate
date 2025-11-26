import apiClient from './apiClient';

/**
 * Submit contact form from candidate
 * @param {Object} contactData - Contact form data
 * @returns {Promise} API response
 */
export const submitContactForm = async (contactData) => {
  const response = await apiClient.post('/contact', contactData);
  return response.data;
};
