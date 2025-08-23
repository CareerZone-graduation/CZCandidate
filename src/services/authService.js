// src/services/authService.js
import apiClient from './apiClient';

export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response; // apiClient now returns data directly
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};