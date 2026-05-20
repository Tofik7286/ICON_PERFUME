import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchAdminProducts,
  fetchProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
} from '../../../../lib/api/productsApi';

export const fetchAdminProductsThunk = createAsyncThunk(
  'adminProducts/fetchProducts',
  async (filters, { rejectWithValue }) => {
    try {
      return await fetchAdminProducts(filters);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchProductBySlugThunk = createAsyncThunk(
  'adminProducts/fetchProductBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      return await fetchProductBySlug(slug);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createProductThunk = createAsyncThunk(
  'adminProducts/createProduct',
  async (payload, { rejectWithValue }) => {
    try {
      return await createProduct(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateProductThunk = createAsyncThunk(
  'adminProducts/updateProduct',
  async ({ slug, data }, { rejectWithValue }) => {
    try {
      return await updateProduct(slug, data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteProductThunk = createAsyncThunk(
  'adminProducts/deleteProduct',
  async (slug, { rejectWithValue }) => {
    try {
      await deleteProduct(slug);
      return slug;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCategoriesThunk = createAsyncThunk(
  'adminProducts/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCategories();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const pending = (state) => {
  state.status = 'loading';
  state.error = null;
};

const rejected = (state, action) => {
  state.status = 'failed';
  state.error = action.payload;
};

const adminProductsSlice = createSlice({
  name: 'adminProducts',
  initialState: {
    products: [],
    selectedProduct: null,
    categories: [],
    pagination: { count: 0, total_pages: 0, current_page: 1 },
    filters: {},
    status: 'idle',
    error: null,
  },
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.current_page = 1;
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProductsThunk.pending, pending)
      .addCase(fetchAdminProductsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload.results;
        state.pagination = {
          count: action.payload.count,
          total_pages: action.payload.total_pages,
          current_page: action.payload.current_page,
        };
      })
      .addCase(fetchAdminProductsThunk.rejected, rejected)

      .addCase(fetchProductBySlugThunk.pending, pending)
      .addCase(fetchProductBySlugThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductBySlugThunk.rejected, rejected)

      .addCase(createProductThunk.pending, pending)
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products.unshift(action.payload);
      })
      .addCase(createProductThunk.rejected, rejected)

      .addCase(updateProductThunk.pending, pending)
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const idx = state.products.findIndex((p) => p.slug === action.payload.slug);
        if (idx !== -1) state.products[idx] = action.payload;
        if (state.selectedProduct?.slug === action.payload.slug) {
          state.selectedProduct = action.payload;
        }
      })
      .addCase(updateProductThunk.rejected, rejected)

      .addCase(deleteProductThunk.pending, pending)
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = state.products.filter((p) => p.slug !== action.payload);
        if (state.selectedProduct?.slug === action.payload) {
          state.selectedProduct = null;
        }
      })
      .addCase(deleteProductThunk.rejected, rejected)

      .addCase(fetchCategoriesThunk.pending, pending)
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategoriesThunk.rejected, rejected);
  },
});

export const { setFilters, clearSelectedProduct, clearError } = adminProductsSlice.actions;
export default adminProductsSlice.reducer;
