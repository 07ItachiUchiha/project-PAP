import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../api/cartAPI';

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.getCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.addToCart(productId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.updateCartItem(productId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await cartAPI.removeFromCart(productId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.clearCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

// Coupon-related async thunks
export const fetchAvailableCoupons = createAsyncThunk(
  'cart/fetchAvailableCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.getAvailableCoupons();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupons');
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (couponCode, { rejectWithValue }) => {
    try {
      const response = await cartAPI.applyCoupon(couponCode);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply coupon');
    }
  }
);

export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (couponId, { rejectWithValue }) => {
    try {
      const response = await cartAPI.removeCoupon(couponId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove coupon');
    }
  }
);

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  subtotal: 0,
  totalDiscount: 0,
  finalAmount: 0,
  appliedCoupons: [],
  availableCoupons: [],
  isLoading: false,
  couponLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Local cart management (for guest users)
    addToLocalCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.product._id === product._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          product,
          quantity,
          _id: product._id + Date.now(), // temporary ID for local storage
        });
      }
      
      // Recalculate totals
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    },
    updateLocalCartItem: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product._id === productId);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.product._id !== productId);
        } else {
          item.quantity = quantity;
        }
      }
      
      // Recalculate totals
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    },
    removeFromLocalCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.product._id !== productId);
      
      // Recalculate totals
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    },
    clearLocalCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const cart = action.payload.cart || {};
        state.items = cart.items || [];
        state.totalQuantity = cart.totalQuantity || 0;
        state.totalAmount = cart.totalAmount || 0;
        state.subtotal = cart.subtotal || 0;
        state.totalDiscount = cart.totalDiscount || 0;
        state.finalAmount = cart.finalAmount || 0;
        state.appliedCoupons = cart.appliedCoupons || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const cart = action.payload.cart;
        state.items = cart.items;
        state.totalQuantity = cart.totalQuantity;
        state.totalAmount = cart.totalAmount;
        state.subtotal = cart.subtotal || 0;
        state.totalDiscount = cart.totalDiscount || 0;
        state.finalAmount = cart.finalAmount || 0;
        state.appliedCoupons = cart.appliedCoupons || [];
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const cart = action.payload.cart;
        state.items = cart.items;
        state.totalQuantity = cart.totalQuantity;
        state.totalAmount = cart.totalAmount;
        state.subtotal = cart.subtotal || 0;
        state.totalDiscount = cart.totalDiscount || 0;
        state.finalAmount = cart.finalAmount || 0;
        state.appliedCoupons = cart.appliedCoupons || [];
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const cart = action.payload.cart;
        state.items = cart.items;
        state.totalQuantity = cart.totalQuantity;
        state.totalAmount = cart.totalAmount;
        state.subtotal = cart.subtotal || 0;
        state.totalDiscount = cart.totalDiscount || 0;
        state.finalAmount = cart.finalAmount || 0;
        state.appliedCoupons = cart.appliedCoupons || [];
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.totalQuantity = 0;
        state.totalAmount = 0;
        state.subtotal = 0;
        state.totalDiscount = 0;
        state.finalAmount = 0;
        state.appliedCoupons = [];
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Available Coupons
      .addCase(fetchAvailableCoupons.pending, (state) => {
        state.couponLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableCoupons.fulfilled, (state, action) => {
        state.couponLoading = false;
        state.availableCoupons = action.payload.coupons || [];
      })
      .addCase(fetchAvailableCoupons.rejected, (state, action) => {
        state.couponLoading = false;
        state.error = action.payload;
      })
      // Apply Coupon
      .addCase(applyCoupon.pending, (state) => {
        state.couponLoading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.couponLoading = false;
        const cart = action.payload.cart;
        state.items = cart.items;
        state.totalQuantity = cart.totalQuantity;
        state.totalAmount = cart.totalAmount;
        state.subtotal = cart.subtotal || 0;
        state.totalDiscount = cart.totalDiscount || 0;
        state.finalAmount = cart.finalAmount || 0;
        state.appliedCoupons = cart.appliedCoupons || [];
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.couponLoading = false;
        state.error = action.payload;
      })
      // Remove Coupon
      .addCase(removeCoupon.pending, (state) => {
        state.couponLoading = true;
        state.error = null;
      })
      .addCase(removeCoupon.fulfilled, (state, action) => {
        state.couponLoading = false;
        const cart = action.payload.cart;
        state.items = cart.items;
        state.totalQuantity = cart.totalQuantity;
        state.totalAmount = cart.totalAmount;
        state.subtotal = cart.subtotal || 0;
        state.totalDiscount = cart.totalDiscount || 0;
        state.finalAmount = cart.finalAmount || 0;
        state.appliedCoupons = cart.appliedCoupons || [];
      })
      .addCase(removeCoupon.rejected, (state, action) => {
        state.couponLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  addToLocalCart,
  updateLocalCartItem,
  removeFromLocalCart,
  clearLocalCart,
} = cartSlice.actions;

export default cartSlice.reducer;
