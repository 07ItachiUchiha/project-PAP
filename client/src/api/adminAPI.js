import api from './index';

export const adminAPI = {
  // Dashboard stats
  getDashboardStats: async () => {
    return await api.get('/admin/dashboard');
  },

  // Product management
  createProduct: async (productData) => {
    return await api.post('/admin/products', productData);
  },

  updateProduct: async (productId, productData) => {
    return await api.put(`/admin/products/${productId}`, productData);
  },

  deleteProduct: async (productId) => {
    return await api.delete(`/admin/products/${productId}`);
  },

  // Order management
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/admin/orders?${queryString}`);
  },

  updateOrderStatus: async (orderId, status) => {
    return await api.put(`/admin/orders/${orderId}`, { orderStatus: status });
  },

  // User management
  getAllUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/admin/users?${queryString}`);
  },

  updateUserRole: async (userId, role) => {
    return await api.put(`/admin/users/${userId}`, { role });
  },

  deleteUser: async (userId) => {
    return await api.delete(`/admin/users/${userId}`);
  },

  // Analytics
  getSalesAnalytics: async (period = '30days') => {
    return await api.get(`/admin/analytics/sales?period=${period}`);
  },

  getProductAnalytics: async () => {
    return await api.get('/admin/analytics/products');
  },

  getUserAnalytics: async () => {
    return await api.get('/admin/analytics/users');
  },
};
