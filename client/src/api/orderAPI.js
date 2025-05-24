import api from './index';

// Create order
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user orders
export const getUserOrders = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/orders/me?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const orderAPI = {
  // Create order
  createOrder: async (orderData) => {
    return await api.post('/orders', orderData);
  },

  // Get user orders
  getUserOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/orders/me?${queryString}`);
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    return await api.get(`/orders/${orderId}`);
  },

  // Update order status (admin only)
  updateOrderStatus: async (orderId, status) => {
    return await api.put(`/admin/orders/${orderId}`, { orderStatus: status });
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    return await api.put(`/orders/${orderId}/cancel`);
  },
};
