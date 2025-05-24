import api from './index';

// Search products with filters
export const searchProducts = async (params) => {
  try {
    const response = await api.get('/search', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get search suggestions
export const getSearchSuggestions = async (query) => {
  try {
    const response = await api.get('/search/suggestions', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get categories for filtering
export const getCategories = async () => {
  try {
    const response = await api.get('/search/categories');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get price ranges for filtering
export const getPriceRanges = async () => {
  try {
    const response = await api.get('/search/price-ranges');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
