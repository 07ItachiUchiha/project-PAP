import api from './index';

// Create Razorpay order
export const createRazorpayOrder = async (data) => {
  try {
    const response = await api.post('/payment/create-order', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Verify payment
export const verifyPayment = async (data) => {
  try {
    const response = await api.post('/payment/verify-payment', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const paymentAPI = {
  // Create Razorpay order
  createOrder: async (amount, orderId) => {
    return await api.post('/payment/create-order', { amount, orderId });
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    return await api.post('/payment/verify-payment', paymentData);
  },

  // Process order payment
  processOrderPayment: async (orderId, paymentDetails) => {
    return await api.post(`/payment/order/${orderId}`, paymentDetails);
  },

  // Get payment status
  getPaymentStatus: async (orderId) => {
    return await api.get(`/payment/status/${orderId}`);
  },

  // Webhook handler (for server-side verification)
  handleWebhook: async (payload, signature) => {
    return await api.post('/payment/webhook', payload, {
      headers: {
        'x-razorpay-signature': signature,
      },
    });
  },
};
