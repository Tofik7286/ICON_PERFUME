import { createSlice } from "@reduxjs/toolkit";

const toastSlice = createSlice({
  name: "toasts",
  initialState: [],
  reducers: {
    addToast: (state, action) => {
      // Add a new toast with a unique ID
      state.push({ id: Date.now(), ...action.payload });
    },
    removeToast: (state, action) => {
      // Remove toast by ID
      return state.filter((toast) => toast.id !== action.payload);
    },
    clearToasts: () => {
      // Clear all toasts
      return [];
    },
  },
});

export const { addToast, removeToast, clearToasts } = toastSlice.actions;
export default toastSlice.reducer;
