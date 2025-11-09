import apiClient from './apiClient';

/**
 * Lấy danh sách CV của candidate
 */
export const getCVs = async () => {
  const response = await apiClient.get('/candidate/cvs');
  return response.data;
};

/**
 * Upload CV mới
 */
export const uploadCV = async (formData) => {
  const response = await apiClient.post('/candidate/cvs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Xóa CV
 */
export const deleteCV = async (cvId) => {
  const response = await apiClient.delete(`/candidate/cvs/${cvId}`);
  return response.data;
};

/**
 * Set CV mặc định
 */
export const setDefaultCV = async (cvId) => {
  const response = await apiClient.patch(`/candidate/cvs/${cvId}/set-default`);
  return response.data;
};

/**
 * Đổi tên CV
 */
export const renameCV = async (cvId, newName) => {
  const response = await apiClient.patch(`/candidate/cvs/${cvId}`, { name: newName });
  return response.data;
};
