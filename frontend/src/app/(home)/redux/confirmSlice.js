// modalSlice.js
import { createSlice } from '@reduxjs/toolkit';

const confirmSlice = createSlice({
  name: 'confirm',
  initialState: {
    isOpen: false,
    message: { title: '', description: '' },
    onConfirm: null,
    loading: false, // Add loading state
  },
  reducers: {
    openConfirmModal: (state, action) => {
      state.isOpen = true;
      state.message = action.payload.message;
      state.onConfirm = action.payload.onConfirm;
      state.loading = false; // Reset loading state when opening
    },
    closeConfirmModal: (state) => {
      state.isOpen = false;
      state.message = { title: '', description: '' };
      state.onConfirm = null;
      state.loading = false; // Reset loading when closing
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { openConfirmModal, closeConfirmModal, setLoading } = confirmSlice.actions;

export const selectConfirmState = (state) => state.confirm;

export default confirmSlice.reducer;
