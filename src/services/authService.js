import axios from 'axios';
import apiClient from './apiClient';

// Separate client for auth endpoints that don't require authentication
const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
});

export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials, {
     withCredentials: true
  });
  return response.data;
};

export const googleLogin = async (token) => {
  const response = await authClient.post('/auth/google-login', {
    token,
    role: 'candidate'
  },
{
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
  const response = await authClient.post('/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post('/auth/logout', null, {
    withCredentials: true
  });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await authClient.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Change password for authenticated user
 * @param {{ currentPassword: string, newPassword: string }} passwords
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const changePassword = async (passwords) => {
  const response = await apiClient.patch('/auth/change-password', passwords);
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  console.log('Reset password request:', { token, password: newPassword }); // Debug log

  try {
    // Try different field names that backend might expect
    const requestData = {
      password: newPassword,
      newPassword: newPassword, // Some backends use newPassword
      confirmPassword: newPassword, // Some backends require confirmation
    };

    console.log('Sending request data:', requestData); // Debug log

    // Try with token in Authorization header (common pattern)
    const response = await authClient.post('/auth/reset-password', requestData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Reset password response:', response); // Debug log
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error.response?.data || error.message); // Debug log

    // If Authorization header fails, try with token in body
    if (error.response?.status === 400) {
      console.log('Trying with token in request body...');
      try {
        const requestDataWithToken = {
          token,
          password: newPassword,
          newPassword: newPassword,
          confirmPassword: newPassword,
        };

        const response = await authClient.post('/auth/reset-password', requestDataWithToken);
        console.log('Reset password response (body):', response);
        return response.data;
      } catch (secondError) {
        console.error('Reset password error (body):', secondError.response?.data || secondError.message);
        throw secondError;
      }
    }

    throw error;
  }
};