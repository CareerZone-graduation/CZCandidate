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
  const response = await apiClient.patch('/candidate/avatar', formData, {
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
  const response = await apiClient.patch(`/candidate/cvs/${cvId}/set-default`);
  return response.data;
};

// Download CV - Note: Backend doesn't have download endpoint, CV path is direct URL
export const downloadCV = async (cvId) => {
  // Since backend returns direct Cloudinary URLs, we can just fetch them
  // This is a placeholder - actual implementation would fetch from cv.path
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

// Lấy thông tin độ hoàn thiện hồ sơ
export const getProfileCompleteness = async (recalculate = false) => {
  const response = await apiClient.get('/candidate/profile/completeness', {
    params: { recalculate }
  });
  return response.data;
};

// Lấy gợi ý cải thiện hồ sơ
export const getProfileRecommendations = async () => {
  const response = await apiClient.get('/candidate/profile/recommendations');
  return response.data;
};

// Cập nhật thông tin ưu tiên (lương, địa điểm, điều kiện làm việc)
export const updateProfilePreferences = async (preferences) => {
  const response = await apiClient.put('/candidate/profile/preferences', preferences);
  return response.data;
};

// Cập nhật cài đặt riêng tư (allowSearch)
export const updatePrivacySettings = async (settings) => {
  const response = await apiClient.patch('/candidate/settings/privacy', settings);
  return response.data;
};

// Lấy cài đặt allow search hiện tại
export const getAllowSearchSettings = async () => {
  const response = await apiClient.get('/candidate/settings/allow-search');
  return response.data;
};

// Toggle allow search với chọn CV
export const toggleAllowSearch = async (data) => {
  const response = await apiClient.patch('/candidate/settings/allow-search', data);
  return response.data;
};
