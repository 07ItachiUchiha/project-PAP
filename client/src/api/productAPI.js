import api from './index';

export const productAPI = {
  // Get all products
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/products?${queryString}`);
  },

  // Get product by ID
  getProductById: async (id) => {
    return await api.get(`/products/${id}`);
  },

  // Get organic products
  getOrganicProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/products/organic?${queryString}`);
  },

  // Search products
  searchProducts: async (searchTerm) => {
    return await api.get(`/products/search?q=${encodeURIComponent(searchTerm)}`);
  },

  // Get products by category
  getProductsByCategory: async (category, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/products/category/${category}?${queryString}`);
  },

  // Get products by type
  getProductsByType: async (type, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/products/type/${type}?${queryString}`);
  },

  // Get featured products
  getFeaturedProducts: async () => {
    return await api.get('/products/featured');
  },

  // Get related products
  getRelatedProducts: async (productId) => {
    return await api.get(`/products/${productId}/related`);
  },
};
