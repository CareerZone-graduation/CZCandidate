import apiClient from './apiClient';

export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials, {
     withCredentials: true
  });
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

// Lấy thông tin profile đầy đủ từ candidate API
export const getMyProfile = async () => {
  const response = await apiClient.get('/candidate/my-profile');
  return response.data;
};

export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post('/auth/logout', null, {
    withCredentials: true
  });
  return response.data;
};