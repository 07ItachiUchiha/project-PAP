import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as returnAPI from '../../api/returnAPI';

// Async thunks for return operations

// Customer return operations
export const createReturnRequest = createAsyncThunk(
  'returns/createReturn',
  async (returnData, { rejectWithValue }) => {
    try {
      const response = await returnAPI.createReturnRequest(returnData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchUserReturns = createAsyncThunk(
  'returns/fetchUserReturns',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await returnAPI.getUserReturns(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchReturnById = createAsyncThunk(
  'returns/fetchReturnById',
  async (returnId, { rejectWithValue }) => {
    try {
      const response = await returnAPI.getReturnById(returnId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateReturnRequest = createAsyncThunk(
  'returns/updateReturn',
  async ({ returnId, updateData }, { rejectWithValue }) => {
    try {
      const response = await returnAPI.updateReturnRequest(returnId, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const cancelReturnRequest = createAsyncThunk(
  'returns/cancelReturn',
  async ({ returnId, reason }, { rejectWithValue }) => {
    try {
      await returnAPI.cancelReturnRequest(returnId, reason);
      return returnId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const checkReturnEligibility = createAsyncThunk(
  'returns/checkEligibility',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await returnAPI.checkReturnEligibility(orderId);
      return { orderId, eligibility: response.data };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Admin return operations
export const fetchAdminReturns = createAsyncThunk(
  'returns/fetchAdminReturns',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await returnAPI.getAdminReturns(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateReturnStatus = createAsyncThunk(
  'returns/updateStatus',
  async ({ returnId, statusData }, { rejectWithValue }) => {
    try {
      const response = await returnAPI.updateReturnStatus(returnId, statusData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const processInspection = createAsyncThunk(
  'returns/processInspection',
  async ({ returnId, inspectionData }, { rejectWithValue }) => {
    try {
      const response = await returnAPI.processInspection(returnId, inspectionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchReturnAnalytics = createAsyncThunk(
  'returns/fetchAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await returnAPI.getReturnAnalytics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  // User returns
  userReturns: [],
  userReturnsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  
  // Current return details
  currentReturn: null,
  
  // Return eligibility check
  eligibilityCheck: {},
  
  // Admin returns
  adminReturns: [],
  adminReturnsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  adminReturnsStats: [],
  
  // Analytics
  analytics: null,
  
  // Loading states
  isLoading: false,
  createLoading: false,
  updateLoading: false,
  eligibilityLoading: false,
  adminLoading: false,
  analyticsLoading: false,
  
  // Error states
  error: null,
  createError: null,
  updateError: null,
  eligibilityError: null,
  adminError: null,
  analyticsError: null
};

const returnSlice = createSlice({
  name: 'returns',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.eligibilityError = null;
      state.adminError = null;
      state.analyticsError = null;
    },
    clearCurrentReturn: (state) => {
      state.currentReturn = null;
    },
    clearEligibilityCheck: (state) => {
      state.eligibilityCheck = {};
    },
    setReturnFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Create return request
      .addCase(createReturnRequest.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createReturnRequest.fulfilled, (state, action) => {
        state.createLoading = false;
        state.userReturns.unshift(action.payload);
        state.currentReturn = action.payload;
      })
      .addCase(createReturnRequest.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      
      // Fetch user returns
      .addCase(fetchUserReturns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserReturns.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userReturns = action.payload.returns;
        state.userReturnsPagination = action.payload.pagination;
      })
      .addCase(fetchUserReturns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch return by ID
      .addCase(fetchReturnById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReturnById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReturn = action.payload;
      })
      .addCase(fetchReturnById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update return request
      .addCase(updateReturnRequest.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateReturnRequest.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.currentReturn = action.payload;
        
        // Update in user returns list
        const index = state.userReturns.findIndex(
          ret => ret._id === action.payload._id
        );
        if (index !== -1) {
          state.userReturns[index] = action.payload;
        }
      })
      .addCase(updateReturnRequest.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Cancel return request
      .addCase(cancelReturnRequest.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(cancelReturnRequest.fulfilled, (state, action) => {
        state.updateLoading = false;
        
        // Update status in user returns list
        const index = state.userReturns.findIndex(
          ret => ret._id === action.payload
        );
        if (index !== -1) {
          state.userReturns[index].status = 'cancelled';
        }
        
        // Update current return if it's the same one
        if (state.currentReturn?._id === action.payload) {
          state.currentReturn.status = 'cancelled';
        }
      })
      .addCase(cancelReturnRequest.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Check return eligibility
      .addCase(checkReturnEligibility.pending, (state) => {
        state.eligibilityLoading = true;
        state.eligibilityError = null;
      })
      .addCase(checkReturnEligibility.fulfilled, (state, action) => {
        state.eligibilityLoading = false;
        state.eligibilityCheck[action.payload.orderId] = action.payload.eligibility;
      })
      .addCase(checkReturnEligibility.rejected, (state, action) => {
        state.eligibilityLoading = false;
        state.eligibilityError = action.payload;
      })
      
      // Admin: Fetch returns
      .addCase(fetchAdminReturns.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminReturns.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminReturns = action.payload.returns;
        state.adminReturnsPagination = action.payload.pagination;
        state.adminReturnsStats = action.payload.stats || [];
      })
      .addCase(fetchAdminReturns.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })
      
      // Admin: Update return status
      .addCase(updateReturnStatus.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateReturnStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        
        // Update in admin returns list
        const index = state.adminReturns.findIndex(
          ret => ret._id === action.payload._id
        );
        if (index !== -1) {
          state.adminReturns[index] = action.payload;
        }
        
        // Update current return if it's the same one
        if (state.currentReturn?._id === action.payload._id) {
          state.currentReturn = action.payload;
        }
      })
      .addCase(updateReturnStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Admin: Process inspection
      .addCase(processInspection.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(processInspection.fulfilled, (state, action) => {
        state.updateLoading = false;
        
        // Update in admin returns list
        const index = state.adminReturns.findIndex(
          ret => ret._id === action.payload._id
        );
        if (index !== -1) {
          state.adminReturns[index] = action.payload;
        }
        
        // Update current return if it's the same one
        if (state.currentReturn?._id === action.payload._id) {
          state.currentReturn = action.payload;
        }
      })
      .addCase(processInspection.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Fetch analytics
      .addCase(fetchReturnAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(fetchReturnAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchReturnAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload;
      });
  }
});

export const {
  clearErrors,
  clearCurrentReturn,
  clearEligibilityCheck,
  setReturnFilters
} = returnSlice.actions;

// Selectors
export const selectAllReturns = (state) => state.returns.adminReturns;
export const selectUserReturns = (state) => state.returns.userReturns;
export const selectCurrentReturn = (state) => state.returns.currentReturn;
export const selectReturnLoading = (state) => state.returns.isLoading || state.returns.fetchLoading;
export const selectCreateLoading = (state) => state.returns.createLoading;
export const selectUpdateLoading = (state) => state.returns.updateLoading;
export const selectEligibilityCheck = (state) => state.returns.eligibilityCheck;
export const selectReturnAnalytics = (state) => state.returns.analytics;

// Selector to find a specific return by ID
export const selectReturnById = (state, returnId) => {
  // Look in admin returns first
  const adminReturn = state.returns.adminReturns.find(ret => ret._id === returnId);
  if (adminReturn) return adminReturn;
  
  // Look in user returns
  const userReturn = state.returns.userReturns.find(ret => ret._id === returnId);
  if (userReturn) return userReturn;
  
  // Return current return if it matches
  if (state.returns.currentReturn?._id === returnId) {
    return state.returns.currentReturn;
  }
  
  return null;
};

export default returnSlice.reducer;
