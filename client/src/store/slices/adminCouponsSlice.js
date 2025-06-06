import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../../api/adminAPI';

// Async thunks for coupon operations
export const fetchAllCoupons = createAsyncThunk(
  'adminCoupons/fetchAllCoupons',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllCoupons(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupons');
    }
  }
);

export const createCoupon = createAsyncThunk(
  'adminCoupons/createCoupon',
  async (couponData, { rejectWithValue }) => {
    try {
      const response = await adminAPI.createCoupon(couponData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create coupon');
    }
  }
);

export const updateCoupon = createAsyncThunk(
  'adminCoupons/updateCoupon',
  async ({ couponId, couponData }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateCoupon(couponId, couponData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update coupon');
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  'adminCoupons/deleteCoupon',
  async (couponId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.deleteCoupon(couponId);
      return { couponId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete coupon');
    }
  }
);

export const getCouponUsage = createAsyncThunk(
  'adminCoupons/getCouponUsage',
  async (couponId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getCouponUsage(couponId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupon usage');
    }
  }
);

const initialState = {
  coupons: [],
  currentCoupon: null,
  usageData: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  filters: {
    search: '',
    status: 'all',
    type: 'all',
  },
  stats: {
    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    totalSavings: 0,
  }
};

const adminCouponsSlice = createSlice({
  name: 'adminCoupons',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setCurrentPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUsageData: (state) => {
      state.usageData = null;
    },
    setCurrentCoupon: (state, action) => {
      state.currentCoupon = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all coupons
      .addCase(fetchAllCoupons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = action.payload.coupons || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 1,
        };
        if (action.payload.stats) {
          state.stats = action.payload.stats;
        }
      })
      .addCase(fetchAllCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create coupon
      .addCase(createCoupon.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.isCreating = false;
        if (action.payload.coupon) {
          state.coupons.unshift(action.payload.coupon);
          state.stats.totalCoupons += 1;
          if (action.payload.coupon.isActive) {
            state.stats.activeCoupons += 1;
          }
        }
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      // Update coupon
      .addCase(updateCoupon.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.isUpdating = false;
        if (action.payload.coupon) {
          const index = state.coupons.findIndex(coupon => coupon._id === action.payload.coupon._id);
          if (index !== -1) {
            state.coupons[index] = action.payload.coupon;
          }
        }
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Delete coupon
      .addCase(deleteCoupon.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.coupons = state.coupons.filter(coupon => coupon._id !== action.payload.couponId);
        state.stats.totalCoupons = Math.max(0, state.stats.totalCoupons - 1);
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })

      // Get coupon usage
      .addCase(getCouponUsage.pending, (state) => {
        state.error = null;
      })
      .addCase(getCouponUsage.fulfilled, (state, action) => {
        state.usageData = action.payload;
      })
      .addCase(getCouponUsage.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  setCurrentPage,
  clearError,
  clearUsageData,
  setCurrentCoupon,
} = adminCouponsSlice.actions;

export default adminCouponsSlice.reducer;
