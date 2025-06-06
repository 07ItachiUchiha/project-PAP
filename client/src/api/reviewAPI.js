import api from './index';

// Get all reviews for a product
export const getProductReviews = async (productId, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products/${productId}/reviews?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get review statistics for a product
export const getReviewStats = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/reviews/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Check if user can review a product
export const canUserReview = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/reviews/can-review`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create a new review
export const createReview = async (productId, reviewData) => {
  try {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update a review
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user's reviews
export const getUserReviews = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/reviews/user/my-reviews?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Mark review as helpful
export const markReviewHelpful = async (reviewId) => {
  try {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Unmark review as helpful
export const unmarkReviewHelpful = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}/helpful`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Report a review
export const reportReview = async (reviewId, reportData) => {
  try {
    const response = await api.post(`/reviews/${reviewId}/report`, reportData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
