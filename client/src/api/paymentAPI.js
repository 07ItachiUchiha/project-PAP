import api from './index';

// Create payment intent
export const createPaymentIntent = async (data) => {
  try {
    const response = await api.post('/payment/create-intent', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Confirm payment
export const confirmPayment = async (data) => {
  try {
    const response = await api.post('/payment/confirm', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const paymentAPI = {
  // Create payment intent
  createPaymentIntent: async (amount, currency = 'inr') => {
    return await api.post('/payment/create-intent', { amount, currency });
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId, paymentMethodId) => {
    return await api.post('/payment/confirm', {
      paymentIntentId,
      paymentMethodId,
    });
  },

  // Process order payment
  processOrderPayment: async (orderId, paymentDetails) => {
    return await api.post(`/payment/order/${orderId}`, paymentDetails);
  },

  // Get payment status
  getPaymentStatus: async (paymentIntentId) => {
    return await api.get(`/payment/status/${paymentIntentId}`);
  },

  // Webhook handler (for server-side verification)
  handleWebhook: async (payload, signature) => {
    return await api.post('/payment/webhook', payload, {
      headers: {
        'stripe-signature': signature,
      },
    });
  },
};
