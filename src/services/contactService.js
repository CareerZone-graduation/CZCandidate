import apiClient from './apiClient';

/**
 * Submit contact form from candidate
 * @param {Object} contactData - Contact form data
 * @param {Array} files - Optional array of files to attach
 * @returns {Promise} API response
 */
export const submitContactForm = async (contactData, files = []) => {
  // If there are files, use FormData
  if (files && files.length > 0) {
    const formData = new FormData();
    
    // Append form fields
    Object.keys(contactData).forEach(key => {
      formData.append(key, contactData[key]);
    });
    
    // Append files
    files.forEach((file) => {
      formData.append('attachments', file);
    });
    
    const response = await apiClient.post('/contact', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
  
  // Otherwise, send as JSON
  const response = await apiClient.post('/contact', contactData);
  return response.data;
};
