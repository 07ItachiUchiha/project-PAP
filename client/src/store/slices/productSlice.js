import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productAPI } from '../../api/productAPI';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productAPI.getProducts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productAPI.getProductById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const fetchOrganicProducts = createAsyncThunk(
  'products/fetchOrganicProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productAPI.getOrganicProducts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch organic products');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await productAPI.searchProducts(searchTerm);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

const initialState = {
  products: [],
  organicProducts: [],
  currentProduct: null,
  searchResults: [],
  filters: {
    category: '',
    type: '',
    priceRange: [0, 10000],
    sortBy: 'name',
    sortOrder: 'asc',
  },  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
  currentPage: 1,
  totalPages: 0,
  loading: false,
  isLoading: false,
  isSearchLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        type: '',
        priceRange: [0, 10000],
        sortBy: 'name',
        sortOrder: 'asc',
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.products = action.payload.products;
        const pagination = action.payload.pagination || {};
        state.pagination = {
          page: action.payload.page || pagination.page || 1,
          limit: action.payload.limit || pagination.limit || 12,
          total: action.payload.total || 0,
          totalPages: Math.ceil((action.payload.total || 0) / (action.payload.limit || pagination.limit || 12)),
        };
        state.currentPage = action.payload.page || pagination.page || 1;
        state.totalPages = Math.ceil((action.payload.total || 0) / (action.payload.limit || pagination.limit || 12));
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload.product;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Organic Products
      .addCase(fetchOrganicProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganicProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organicProducts = action.payload.products;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchOrganicProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search Products
      .addCase(searchProducts.pending, (state) => {
        state.isSearchLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isSearchLoading = false;
        state.searchResults = action.payload.products;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isSearchLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setPagination,
  clearCurrentProduct,
  clearSearchResults,
} = productSlice.actions;

export default productSlice.reducer;
