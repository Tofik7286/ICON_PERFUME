import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Async thunk to fetch products
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/products/`);
            const data = response.data;
            
            if (data.success) {
                return data.variants; // Return the product data
            } else {
                return rejectWithValue('Failed to fetch products');
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Something went wrong');
        }
    }
);

export const fetchCategories = createAsyncThunk(
    'products/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/categories/`);
            const json = response.data;
            if (json.success) {
                return json.sub_categories;
            } else {
                return rejectWithValue('Failed to fetch categories');
            }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchBanners = createAsyncThunk(
    'products/fetchBanners',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/banners/`);
            const json = response.data;
            if (json.success) {
                return json.banners.filter((_, i) => _.is_active === true);
            } else {
                return rejectWithValue('Failed to fetch Banners');
            }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Products slice
const productsSlice = createSlice({
    name: 'products',
    initialState: {
        products: [],
        variant: [],
        banners: [],
        categories: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
        loading: false,
    },
    reducers: {
        setVariant: (state, action) => {
            state.variant = action.payload;
        },
        setProducts: (state, action) => {
            state.products = action.payload;
        },
        setBanners: (state, action) => {
            state.banners = action.payload;
        },
        setCategories: (state, action) => {
            state.categories = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.status = 'loading';
                state.loading = true
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.loading = false
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false
                state.error = action.payload || 'Failed to fetch products';
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchBanners.fulfilled, (state, action) => {
                state.loading = false;
                state.banners = action.payload;
            })
    },
});

// Export actions and reducer
export const { setVariant, setProducts, setBanners, setCategories } = productsSlice.actions;
export default productsSlice.reducer;
