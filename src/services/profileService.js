import apiClient from './apiClient';

// Lấy thông tin profile của user
export const getMyProfile = async () => {
  const response = await apiClient.get('/candidate/my-profile');
  return response.data;
};
export const getMe = async () => {
  const response = await apiClient.get('/users/me');
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

// Lấy số dư xu của user
export const getMyCoinBalance = async () => {
  const response = await apiClient.get('/users/me/coins');
  return response.data;
};

// Upload CV
export const uploadCV = async (formData) => {
  const response = await apiClient.post('/candidate/cvs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Xóa CV
export const deleteCV = async (cvId) => {
  const response = await apiClient.delete(`/candidate/cvs/${cvId}`);
  return response.data;
};

// Set CV mặc định
export const setDefaultCV = async (cvId) => {
  const response = await apiClient.put(`/candidate/cvs/${cvId}/set-default`);
  return response.data;
};

// Download CV
export const downloadCV = async (cvId) => {
  const response = await apiClient.get(`/candidate/cvs/${cvId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};
// Lấy danh sách CV profiles
export const getCvProfiles = async () => {
  const response = await apiClient.get('/candidate/cv-profiles');
  return response;
};

// Lấy thông tin user hiện tại (bao gồm profile)
export const getCurrentUserProfile = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};
