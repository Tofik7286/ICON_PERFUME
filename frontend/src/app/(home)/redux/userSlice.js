'use client';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { loader } from './loaderSlice';
import { addToast } from './toastSlice';
import { closeModal } from './modalSlice';
import { setRedirect } from './redirectSlice';

const cookies = new Cookies();
const url = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
// Define an async thunk for fetching the user
export const fetchUser = createAsyncThunk('user/fetchUser', async () => {
    
    try {
        const response = await axios.get(`${url}/profile/`,{
            withCredentials:true
        }
        );
        if (response.data.success) {
            
            return response.data; // Return the user data
        } else {

        }
    } catch (error) {
        console.error('Internal server error:', error);
        return null
    }
});

export const deleteUser = createAsyncThunk(
    'user/deleteUser',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await fetch(`${url}/profile/`, { credentials: "include", method: 'DELETE' });
            const json = await response.json();

            if (json.success) {
                dispatch(addToast({ message: json.message, type: 'success' }));
                dispatch(setRedirect('/'));
                return { success: true };
            } else {
                dispatch(addToast({ message: json.message, type: 'error' }));
                return rejectWithValue(json.message);
            }
        } catch (error) {
            dispatch(addToast({ message: error.message, type: 'error' }));
            return rejectWithValue(error.message);
        }
    })

export const fetchAddresses = createAsyncThunk('user/fetchAddresses', async () => {

   
    try {
        const response = await axios.get(`${url}/getAllAddresses/`,{
            withCredentials:true
        });

        if (response.data.success) {
            return response.data.address; // Return the user data
        } else {

        }
    } catch (error) {
        console.error('Internal server error:', error);
    }
});

export const addAddress = createAsyncThunk('user/addAddress', 
    async (data, { rejectWithValue, dispatch }) => {
  

    try {
        dispatch(loader(true))
        const response = await fetch(`${url}/addresses/`, {
            method: 'POST',
            credentials:"include",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        const json = await response.json()
        if (json.success) {
            dispatch(addToast({ message: json.message, type: 'success' }));
            dispatch(closeModal())
            return json.address
        }
        else {
            dispatch(setRedirect('/login/'))
            dispatch(addToast({ message: json.message, type: 'error' }));
            return rejectWithValue(json.message)
        }
    } catch (error) {
        dispatch(addToast({ message: error.message, type: 'error' }));
    } finally {
        dispatch(loader(false))
    }
});

// Create the slice
const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        addresses: [],
        scrolled: true,
        status: 'idle', // idle | loading | succeeded | failed
        error: null,
    },
    reducers: {
        setStatus: (state, action) => {
            state.status = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setScrolled: (state, action) => {
            state.scrolled = action.payload;
        }
        // You can define synchronous reducers here if needed
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.addresses = action.payload || [];
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = null;
            })
            .addCase(addAddress.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.addresses.push(action.payload);
            })
    },
});

// Export selectors
export const { setUser, setScrolled } = userSlice.actions
export const selectUser = (state) => state.user;

// Export reducer
export default userSlice.reducer;
