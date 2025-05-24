import api from './index';

export const cartAPI = {
  // Get cart
  getCart: async () => {
    return await api.get('/cart');
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    return await api.post('/cart', { productId, quantity });
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity) => {
    return await api.put('/cart', { productId, quantity });
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    return await api.delete(`/cart/${productId}`);
  },

  // Clear cart
  clearCart: async () => {
    return await api.delete('/cart');
  },

  // Sync local cart with server cart (for when user logs in)
  syncCart: async (localCartItems) => {
    return await api.post('/cart/sync', { items: localCartItems });
  },
};
