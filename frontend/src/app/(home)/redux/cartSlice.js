'use client';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { addToast } from './toastSlice';
import { loader } from './loaderSlice';
import CryptoJS from 'crypto-js';
import  secureLocalStorage  from  "react-secure-storage";
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
    secureLocalStorage.setItem("cart_hashData", encryptedData)
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
    const token = cookies.get('is_logged_in');
    
    if (!token) {
        const encodedData = secureLocalStorage.getItem("cart_hashData")
        const data = decryptData(encodedData)
        return data.length > 0 ? data : []
    } else {
        try {
            const response = await fetch(`${url}/cart/`, {credentials:"include", method: "GET" });
            const json = await response.json()
            if (json.success) {
                return json.cart_items; // Return the user data
            } else {

                return []
            }
        } catch (error) {
            console.error('Internal server error:', error);
            return []
        }
    }   
});

// ZERO-TRUST: Force API call to sync cart items with DB (authenticated users)
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({quantity, variant_data}, { rejectWithValue, dispatch, getState }) => {
        dispatch(loader(true))
        const token = cookies.get('is_logged_in')
        const var_id = variant_data.id
        
        if(!token){
            // GUEST USERS: Use local storage only
            try {
                const state = getState();
                let cartItems = state.cart.cart;
                
                const isItemInCart = cartItems.some(item => item.variant.id === var_id);
                if(isItemInCart){
                    await dispatch(increaseQty({id: var_id, quantity: quantity}));
                    dispatch(cartDrawer(true))
                    return rejectWithValue('Item quantity increased');
                }

                const data = { variant: variant_data, quantity: quantity };
                const finalData = [...cartItems, data]
                saveToSession(finalData)
                dispatch(addToast({ message: "Product Added To Cart", type: 'success' }));
                return {cart: data, quantity: quantity};

            } catch (error) {
                dispatch(addToast({ message: error.message, type: 'error' }));
                return rejectWithValue(error.message);
            } finally{
                dispatch(loader(false))
            }
        } else { 
            // AUTHENTICATED USERS: Force POST to /cart/ endpoint with JSON payload
            try {
                const response = await fetch(
                    `${url}/cart/`,
                    { 
                        credentials: "include",
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            variant_id: var_id,
                            quantity: quantity
                        })
                    }
                );
                const json = await response.json();
                
                if (response.ok && json.success) {
                    // SYNC SUCCESS: Update Redux state ONLY after 200 OK from backend
                    dispatch(addToast({ message: json.message, type: 'success' }));
                    dispatch(cartDrawer(true));
                    return {cart: json.cart, quantity: quantity};
                } else {
                    // Handle failure cases
                    dispatch(
                        addToast({
                            message: json.message || 'Failed to add item to cart',
                            type: 'error',
                        })
                    );
                    if (response.status === 401) {
                        dispatch(setRedirect(`/login/`));
                    }
                    return rejectWithValue(json.message || 'Unknown error occurred');
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

// LOGIN-TIME SYNC: Migrate guest cart items to DB after authentication
export const syncLocalCartWithDB = createAsyncThunk(
    'cart/syncLocalCartWithDB',
    async (_, { rejectWithValue, dispatch, getState }) => {
        try {
            const state = getState();
            const localCartItems = state.cart.cart;
            
            if (!localCartItems || localCartItems.length === 0) {
                return { success: true, synced: 0 }; // Nothing to sync
            }
            
            let syncedCount = 0;
            
            // Sync each item to backend via POST /cart/
            for (const item of localCartItems) {
                try {
                    const response = await fetch(
                        `${url}/cart/`,
                        {
                            credentials: "include",
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                variant_id: item.variant.id,
                                quantity: item.quantity
                            })
                        }
                    );
                    const json = await response.json();
                    if (response.ok && json.success) {
                        syncedCount++;
                    }
                } catch (itemError) {
                    console.error(`Failed to sync item ${item.variant.id}:`, itemError);
                }
            }
            
            if (syncedCount > 0) {
                dispatch(addToast({ 
                    message: `Synced ${syncedCount} item(s) to cart`, 
                    type: 'success' 
                }));
                // Clear local storage after successful sync
                secureLocalStorage.removeItem("cart_hashData");
                // Refresh cart from DB
                dispatch(fetchCart());
            }
            
            return { success: true, synced: syncedCount };
        } catch (error) {
            console.error('Error syncing cart:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const increaseQty = createAsyncThunk(
    'cart/increaseQty',
    async ({id, quantity}, { rejectWithValue, dispatch, getState }) => {
        dispatch(loader(true))
        const token = cookies.get('is_logged_in');

        if(!token){
            try {
                    
                const state = getState();
                let cartItems = state.cart.cart; // Assuming cart items are stored in `state.cart.items`
                const updatedCart = cartItems.map(item => {
                    if (item.variant.id === id) {
                        if (item.quantity < item.variant.stock){
                            return { ...item, quantity: item.quantity + quantity }; // Increase quantity
                        }
                    }
                    return item;
                });
                
                saveToSession(updatedCart)
                return { id, quantity, success: true };
                
            } catch (error) {

            } finally{
                dispatch(loader(false))
            }
        } else {
            try {
                const response = await fetch(`${url}/plus-cart/${id}/?quantity=${quantity}`, {credentials:"include", method: 'POST' });
                const json = await response.json()
                if (json.success) {
                    // dispatch(addToast({ message: 'Quantity increased!', type: 'success' }));
                    return { id, quantity, success: true };
                } else {
                    if(response.status === 404){
                        dispatch(setRedirect(`/login/`)); // Set redirect to Dashboard
                    }
                    dispatch(
                        addToast({
                            message: json.message || 'Failed to add item to cart',
                            type: 'error',
                        })
                    );
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

export const decreaseQty = createAsyncThunk(
    'cart/decreaseQty',
    async (id, { rejectWithValue, dispatch, getState }) => {
        dispatch(loader(true))
        const token = cookies.get('is_logged_in');

        
        if(!token){
            try {
                    
                const state = getState();
                let cartItems = state.cart.cart; // Assuming cart items are stored in `state.cart.items`
                let updatedCart = cartItems.map(item => {
                    if (item.variant.id === id) {
                                                    
                        return { ...item, quantity: item.quantity - 1 }; // Increase quantity
                    }
                    return item;
                });
                
                saveToSession(updatedCart)
                return { id, success: true };
                
            } catch (error) {

            } finally{
                dispatch(loader(false))
            }
        } else {
            try {
                const response = await fetch(`${url}/minus-cart/${id}/`, { credentials:"include",method: 'POST' });
                const json = await response.json()
                if (json.success) {
                    // dispatch(addToast({ message: 'Quantity decreased!', type: 'success' }));
                    return { id, success: true };
                } else {
                    dispatch(setRedirect(`/login/`)); // Set redirect to Dashboard
                    dispatch(
                        addToast({
                            message: json.message || 'Failed to add item to cart',
                            type: 'error',
                        })
                    );
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
export const setQty = createAsyncThunk(
    'cart/setQty',
    async ({ id, quantity }, { rejectWithValue, dispatch, getState }) => {
        dispatch(loader(true));
        const token = cookies.get('is_logged_in');

        if (!token) {
            try {
                const state = getState();
                let cartItems = state.cart.cart;

                const updatedCart = cartItems.map(item => {
                    if (item.variant.id === id) {
                        if (quantity < item.variant.stock){
                            return { ...item, quantity }; // Set new quantity directly
                        }
                    }
                    return item;
                });

                saveToSession(updatedCart);
                return { id, quantity, success: true };

            } catch (error) {

            } finally {
                dispatch(loader(false));
            }
        } else {
            try {
                const response = await fetch(`${url}/set-cart/${id}/?quantity=${quantity}`, {
                    credentials:"include",
                    method: 'POST',
                });

                const json = await response.json();
                if (json.success) {
                    return { id, quantity, success: true };
                } else {
                    dispatch(setRedirect(`/login/`));
                    dispatch(
                        addToast({
                            message: json.message || 'Failed to set quantity',
                            type: 'error',
                        })
                    );
                }
            } catch (error) {
                dispatch(addToast({ message: error.message, type: 'error' }));
                return rejectWithValue(error.message);
            } finally {
                dispatch(loader(false));
            }
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (id, { rejectWithValue, dispatch, getState }) => {
        dispatch(loader(true))
        const token = cookies.get('is_logged_in');

        if(!token){
            try {
                    
                const state = getState();
                let cartItems = state.cart.cart; // Assuming cart items are stored in `state.cart.items`
                const updatedCart = cartItems.filter((item) => item.variant.id !== id);

                saveToSession(updatedCart)
                return { id, success: true };
                
            } catch (error) {

            } finally{
                dispatch(loader(false))
            }
        } else {
            try {
                const response = await fetch(`${url}/remove-from-cart/${id}/`, { credentials:"include", method: 'DELETE' });
                const json = await response.json()
                if (json.success) {
                    dispatch(addToast({ message: 'Item removed from cart!', type: 'success' }));
                    return { id, success: true };
                } else {
                    throw new Error(json.message || 'Failed to remove item');
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
const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        cart: [],
        total: 0,
        status: 'idle',
        error: null,
        openCart: false,
    },
    reducers: {
        cartDrawer: (state, action) => {
            state.openCart = action.payload;
        },
        setCartItems: (state, action) => {
            state.cart = action.payload
        },
        setTotal: (state, action) => {
            state.total = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch cart
            .addCase(fetchCart.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.status = 'succeded';
                state.cart = action.payload === "undefined" ? [] : action.payload;
                state.total = action.payload && action.payload.reduce((total, item) => total + item.variant.discounted_price * item.quantity, 0);
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Add to cart (ZERO-TRUST: Only update after API success)
            .addCase(addToCart.fulfilled, (state, action) => {
                const existingItem = state.cart.find(item => item.variant.id === action.payload.cart.variant.id);
                if (existingItem) {
                    // Item already in cart: this was an update via update_or_create
                    const oldQty = existingItem.quantity;
                    const newQty = action.payload.cart.quantity;
                    const qtyDiff = newQty - oldQty;
                    existingItem.quantity = newQty;
                    state.total += parseFloat(existingItem.variant.discounted_price) * qtyDiff;
                } else {
                    // New item: add to cart
                    state.cart.push(action.payload.cart);
                    state.total += parseFloat(action.payload.cart.variant.discounted_price) * action.payload.quantity;
                }
                state.openCart = true;
            })
            
            // Sync local cart with DB on login
            .addCase(syncLocalCartWithDB.fulfilled, (state, action) => {
                // Cart is automatically refreshed via fetchCart dispatch in the thunk
                // This just marks the end of sync
                state.status = 'synced';
            })
            .addCase(syncLocalCartWithDB.rejected, (state, action) => {
                console.error('Failed to sync cart:', action.payload);
                state.error = action.payload;
            })
            
            // Increase quantity
            .addCase(increaseQty.fulfilled, (state, action) => {
                const item = state.cart.find((item) => item.variant.id === action.payload.id);
                if (item) {
                    if(item.quantity<item.variant.stock){
                        item.quantity += action.payload.quantity;
                        state.total = state.total + JSON.parse(item.variant.discounted_price) * action.payload.quantity
                    }
                }
            })
            // Decrease quantity
            .addCase(decreaseQty.fulfilled, (state, action) => {
                const item = state.cart.find((item) => item.variant.id === action.payload.id);
                if (item && item.quantity > 1) {
                    item.quantity -= 1;
                    state.total = state.total - JSON.parse(item.variant.discounted_price)
                }
            })
            .addCase(setQty.fulfilled, (state, action) => {
                const item = state.cart.find(item => item.variant.id === action.payload.id);
                if (item) {
                    const oldQty = item.quantity;
                    if (action.payload.quantity <item.variant.stock){
                        item.quantity = action.payload.quantity;
                        const diff = action.payload.quantity - oldQty;
                        state.total += JSON.parse(item.variant.discounted_price) * diff;
                    }
                }
            })

            // Remove from cart
            .addCase(removeFromCart.fulfilled, (state, action) => {
                const item = state.cart.find((item) => item.variant.id === action.payload.id);
                if(item){
                    state.cart = state.cart.filter((item) => item.variant.id !== action.payload.id);
                    state.total = state.total - item.variant.discounted_price * item.quantity
                }
            });
    },
});

// Export actions
export const { cartDrawer, setCartItems, setTotal } = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartStatus = (state) => state.status;
export const selectCartError = (state) => state.error;

// Reducer
export default cartSlice.reducer;