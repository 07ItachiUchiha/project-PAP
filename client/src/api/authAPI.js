import api from './index';

export const authAPI = {
  // Register user
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  // Login user
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  // Logout user
  logout: async () => {
    return await api.post('/auth/logout');
  },

  // Get user profile
  getProfile: async () => {
    return await api.get('/auth/me');
  },

  // Update user profile
  updateProfile: async (userData) => {
    return await api.put('/auth/update', userData);
  },

  // Change password
  changePassword: async (passwordData) => {
    return await api.put('/auth/change-password', passwordData);
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token, password) => {
    return await api.put(`/auth/reset-password/${token}`, { password });
  },

  // Verify email
  verifyEmail: async (token) => {
    return await api.put(`/auth/verify-email/${token}`);
  },
};
