import api from './index';

export const wishlistAPI = {
  // Get wishlist
  getWishlist: async () => {
    return await api.get('/wishlist');
  },

  // Add product to wishlist
  addToWishlist: async (productId) => {
    return await api.post('/wishlist', { productId });
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId) => {
    return await api.delete(`/wishlist/${productId}`);
  },

  // Clear wishlist
  clearWishlist: async () => {
    return await api.delete('/wishlist');
  },
};

export default wishlistAPI;
