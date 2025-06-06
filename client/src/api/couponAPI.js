import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/coupons`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Coupon API functions

// Admin functions
export const createCoupon = async (couponData) => {
  const response = await api.post('/', couponData);
  return response.data;
};

export const getAllCoupons = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });
  
  const response = await api.get(`/?${params.toString()}`);
  return response.data;
};

export const getCouponById = async (couponId) => {
  const response = await api.get(`/${couponId}`);
  return response.data;
};

export const updateCoupon = async (couponId, updateData) => {
  const response = await api.put(`/${couponId}`, updateData);
  return response.data;
};

export const deleteCoupon = async (couponId) => {
  const response = await api.delete(`/${couponId}`);
  return response.data;
};

export const getCouponStats = async (couponId) => {
  const response = await api.get(`/${couponId}/stats`);
  return response.data;
};

export const bulkCouponOperations = async (operation, couponIds, data = {}) => {
  const response = await api.post('/bulk', {
    operation,
    couponIds,
    data
  });
  return response.data;
};

// User functions
export const validateCoupon = async (code, cartItems = [], userId = null) => {
  try {
    const response = await api.post('/validate', {
      code,
      cartItems,
      userId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const applyCoupon = async (couponId, orderId) => {
  const response = await api.post('/apply', {
    couponId,
    orderId
  });
  return response.data;
};

export const getAvailableCoupons = async () => {
  const response = await api.get('/available');
  return response.data;
};

// Helper function to calculate discount preview
export const calculateDiscountPreview = (coupon, cartSubtotal, applicableProducts = []) => {
  if (!coupon || !coupon.isCurrentlyValid) return 0;
  
  let discount = 0;
  
  switch (coupon.type) {
    case 'percentage':
      discount = (cartSubtotal * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
      break;
      
    case 'fixed':
      discount = Math.min(coupon.value, cartSubtotal);
      break;
      
    case 'free_shipping':
      // This would be handled in shipping calculation
      discount = 0;
      break;
      
    case 'buy_x_get_y':
      // This needs special handling based on cart items
      if (applicableProducts.length > 0) {
        const eligibleItems = applicableProducts.filter(p => p.quantity >= coupon.buyXGetY.buyQuantity);
        if (eligibleItems.length > 0) {
          const sets = Math.min(
            Math.floor(eligibleItems[0].quantity / coupon.buyXGetY.buyQuantity),
            coupon.buyXGetY.maxSets
          );
          const freeItems = sets * coupon.buyXGetY.getQuantity;
          discount = freeItems * eligibleItems[0].price;
        }
      }
      break;
      
    default:
      discount = 0;
  }
  
  return Math.round(discount * 100) / 100;
};

// Helper function to format coupon for display
export const formatCouponForDisplay = (coupon) => {
  if (!coupon) return null;
  
  const now = new Date();
  const isValid = coupon.isActive && 
                  now >= new Date(coupon.validFrom) && 
                  now <= new Date(coupon.validTo);
  
  let description = '';
  switch (coupon.type) {
    case 'percentage':
      description = `${coupon.value}% off${coupon.maxDiscount ? ` (max $${coupon.maxDiscount})` : ''}`;
      break;
    case 'fixed':
      description = `$${coupon.value} off`;
      break;
    case 'free_shipping':
      description = 'Free shipping';
      break;
    case 'buy_x_get_y':
      description = `Buy ${coupon.buyXGetY.buyQuantity} get ${coupon.buyXGetY.getQuantity} free`;
      break;
    default:
      description = coupon.description || 'Discount';
  }
  
  return {
    ...coupon,
    isValid,
    displayDescription: description,
    formattedValidTo: new Date(coupon.validTo).toLocaleDateString(),
    formattedValidFrom: new Date(coupon.validFrom).toLocaleDateString(),
    remainingDays: Math.ceil((new Date(coupon.validTo) - now) / (1000 * 60 * 60 * 24))
  };
};

// Helper function to check if coupon can be applied to cart
export const canApplyCouponToCart = (coupon, cartItems, cartSubtotal, userOrderCount = 0) => {
  if (!coupon || !coupon.isCurrentlyValid) {
    return { canApply: false, reason: 'Coupon is not valid' };
  }
  
  // Check minimum order value
  if (coupon.minOrderValue && cartSubtotal < coupon.minOrderValue) {
    return { 
      canApply: false, 
      reason: `Minimum order value of $${coupon.minOrderValue} required` 
    };
  }
  
  // Check first-time customer restriction
  if (coupon.firstTimeOnly && userOrderCount > 0) {
    return { 
      canApply: false, 
      reason: 'This coupon is only valid for first-time customers' 
    };
  }
  
  // Check if any cart items are applicable
  if (coupon.applicableProducts.type !== 'all') {
    // This would need product category information to validate properly
    // For now, we'll assume it's valid and let the backend validate
  }
  
  return { canApply: true, reason: null };
};

export default {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  getCouponStats,
  bulkCouponOperations,
  validateCoupon,
  applyCoupon,
  getAvailableCoupons,
  calculateDiscountPreview,
  formatCouponForDisplay,
  canApplyCouponToCart
};
