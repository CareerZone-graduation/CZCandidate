import apiClient from './apiClient';

// Lấy thông tin profile của user
export const getMyProfile = async () => {
  const response = await apiClient.get('/candidate/my-profile');
  return response.data;
};

// Cập nhật thông tin profile
export const updateProfile = async (profileData) => {
  const response = await apiClient.put('/candidate/my-profile', profileData);
  return response.data;
};

// Upload avatar
export const uploadAvatar = async (formData) => {
  const response = await apiClient.post('/candidate/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Upload CV
export const uploadCV = async (formData) => {
  const response = await apiClient.post('/candidate/upload-cv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Xóa CV
export const deleteCV = async (cvId) => {
  const response = await apiClient.delete(`/candidate/cv/${cvId}`);
  return response.data;
};

// Set CV mặc định
export const setDefaultCV = async (cvId) => {
  const response = await apiClient.put(`/candidate/cv/${cvId}/set-default`);
  return response.data;
};