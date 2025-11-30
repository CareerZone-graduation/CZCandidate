import apiClient from './apiClient';

/**
 * Get all job alerts for current user
 */
export const getMyJobAlerts = async () => {
  const { data } = await apiClient.get('/job-alerts');
  return data.data;
};

/**
 * Create a new job alert
 */
export const createJobAlert = async (alertData) => {
  const { data } = await apiClient.post('/job-alerts', alertData);
  return data.data;
};

/**
 * Update a job alert
 */
export const updateJobAlert = async (id, alertData) => {
  const { data } = await apiClient.put(`/job-alerts/${id}`, alertData);
  return data.data;
};

/**
 * Delete a job alert
 */
export const deleteJobAlert = async (id) => {
  const { data } = await apiClient.delete(`/job-alerts/${id}`);
  return data;
};
