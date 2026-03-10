'use client';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { addToast } from './toastSlice';
import { loader } from './loaderSlice';
import CryptoJS from 'crypto-js';
import secureLocalStorage from "react-secure-storage";
import { setRedirect } from './redirectSlice';

const cookies = new Cookies();
const url = process.env.NEXT_PUBLIC_API_URL;

const SECRET_KEY = process.env.NEXT_PUBLIC_COOKIE_SECRET;

// Utility: Encrypt data
const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};
// Utility: Decrypt data
const decryptData = (encryptedData) => {
    if (!encryptedData) {
        return [];
    }
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
        console.error('Decryption failed:', error);
        return [];
    }
};

// Utility: Save to cookies
const saveToSession = (data) => {
    const encryptedData = encryptData(data);
    secureLocalStorage.setItem("wishList_hashData", encryptedData)
};

export const fetchWishList = createAsyncThunk('wishList/fetchWishList', async () => {
    const token = cookies.get('is_logged_in');
    if (!token) {
        const encodedData = secureLocalStorage.getItem("wishList_hashData")
        const data = decryptData(encodedData)
        return data.length > 0 ? data : []
    } else {
        try {
            const response = await fetch(`${url}/getAllWishlists/`, { credentials:"include", method: "GET" });
            const json = await response.json()
            if (json.success) {
                return json.wishlists; // Return the user data
            } else {

                return [];
            }
        } catch (error) {
            console.error('Internal server error:', error);
        }
    }
});

export const addWishList = createAsyncThunk(
    'wishList/addWishList',
    async (data, { rejectWithValue, dispatch, getState }) => {
        dispatch(loader(true))
        const token = cookies.get('is_logged_in');
        const id = data.id;

        if (!token) {
            try {

                const state = getState();
                const wishListItems = state.wishList.wishList; // Assuming cart items are stored in `state.cart.items`

                if (wishListItems) {
                    const isItemInList = wishListItems.some(item => item.variant.id === id);
                    if (isItemInList) {
                        dispatch(addToast({ type: 'success', message: 'Item already in wishlist' }));
                        return rejectWithValue('Item already in wishlist');
                    }
                }

                const variant_Data = { variant: data };
                const finalData = [...wishListItems, variant_Data]
                saveToSession(finalData)
                dispatch(addToast({ message: "Product Added To Wishlist", type: 'success' }));
                return variant_Data;

            } catch (error) {

            } finally {
                dispatch(loader(false))
            }
        } else {
            try {

                const state = getState();
                const wishListItems = state.wishList.wishList; // Assuming cart items are stored in `state.cart.items`

                // Check if the item is already in the cart
                if (wishListItems) {
                    const isItemInList = wishListItems.some(item => item.variant.id === id);
                    if (isItemInList) {
                        dispatch(addToast({ type: 'success', message: 'Item already in wishlist' }));
                        return rejectWithValue('Item already in wishlist');
                    }
                }

                const response = await fetch(
                    `${url}/add-wishlist/${id}/`,
                    {
                        credentials:"include",
                        method: "POST"
                    }
                );
                const json = await response.json()
                if (json.success) {
                    dispatch(addToast({ message: json.message, type: 'success' }));
                    return json.wishlists;
                } else {
                    dispatch(addToast({ message: json.message || 'Failed to Add item to cart', type: 'error' }));
                    dispatch(setRedirect('/login/'))
                }
            } catch (error) {
                dispatch(addToast({ message: error.message, type: 'error' }));
                return rejectWithValue(error.message);
            } finally {
                dispatch(loader(false))
            }
        }
    }
);

export const removeWishList = createAsyncThunk(
    'wishList/removeWishList',
    async (id, { rejectWithValue, dispatch, getState }) => {
        dispatch(loader(true))
        const token = cookies.get('is_logged_in');

        if (!token) {

            try {
                const state = getState();
                const wishListItems = state.wishList.wishList; // Assuming cart items are stored in `state.cart.items`
                const finalData = wishListItems.filter((item) => item.variant.id !== id);

                saveToSession(finalData)
                dispatch(addToast({ message: "Product Removed To Wishlist", type: 'success' }));
                return { id, success: true }

            } catch (error) {

            } finally {
                dispatch(loader(false))
            }

        } else {

            try {
                const response = await fetch(`${url}/remove-wishlist/${id}/`, {credentials:"include", method: 'DELETE' });
                const json = await response.json()
                if (json.success) {
                    dispatch(addToast({ message: json.message, type: 'success' }));
                    return { id, success: true };
                } else {
                    dispatch(setRedirect('/login/'))
                    dispatch(addToast({ message: json.message || 'Failed to Add item to cart', type: 'error' }));
                }
            } catch (error) {
                dispatch(addToast({ message: error.message, type: 'error' }));
                return rejectWithValue(error.message);
            } finally {
                dispatch(loader(false))
            }
        }
    }
);

// Slice
const wishListSlice = createSlice({
    name: 'wishList',
    initialState: {
        wishList: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        setWishListItem: (state, action) => {
            state.wishList = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch cart
            .addCase(fetchWishList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchWishList.fulfilled, (state, action) => {
                state.status = 'succeded';
                state.wishList = action.payload === "undefined" ? [] : action.payload;
            })
            .addCase(fetchWishList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Add to cart
            .addCase(addWishList.fulfilled, (state, action) => {
                state.wishList.push(action.payload);
            })
            // Remove from wishlist
            .addCase(removeWishList.fulfilled, (state, action) => {
                state.wishList = state.wishList.filter((item) => item.variant.id !== action.payload.id);
            });
    },
});

// Export actions
// Selectors
export const { setWishListItem } = wishListSlice.actions;
export const selectWishList = (state) => state.wishList;

// Reducer
export default wishListSlice.reducer;