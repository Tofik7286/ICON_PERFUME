'use client'
import { configureStore } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import cartSlice from './cartSlice'
import toastSlice from './toastSlice'
import loaderSlice from './loaderSlice'
import wishListSlice from './wishListSlice'
import modalReducer from './modalSlice';
import checkoutReducer from './checkoutSlice'
import productsReducer from './productSlice'
import confirmReducer from './confirmSlice'
import cookieReducer from './cookieSlice'
import redirectReducer from './redirectSlice'

const store = configureStore({
  reducer: {
    user: userSlice,
    cart: cartSlice,
    toasts: toastSlice,
    loader: loaderSlice,
    wishList: wishListSlice,
    modal: modalReducer,
    checkout: checkoutReducer,
    products: productsReducer,
    confirm: confirmReducer,
    cookie: cookieReducer,
    redirect: redirectReducer
  },
});

export default store;
