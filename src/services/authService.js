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
