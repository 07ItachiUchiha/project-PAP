import api from './index';

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
