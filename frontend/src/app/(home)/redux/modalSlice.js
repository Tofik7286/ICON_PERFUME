// store/modalSlice.js
import { createSlice } from '@reduxjs/toolkit';

// External callback registry — keeps non-serializable resolve functions OUT of Redux state
const _modalCallbacks = new Map();
let _callbackId = 0;

export function registerModalCallback(resolveFn) {
  const id = ++_callbackId;
  _modalCallbacks.set(id, resolveFn);
  return id; // serializable ID stored in Redux
}

export function executeModalCallback(id, payload) {
  const cb = _modalCallbacks.get(id);
  if (cb) {
    cb(payload);
    _modalCallbacks.delete(id);
  }
}

const initialState = {
  isOpen: false,
  component: null,
  url: null,
  modalProps: {}, // Contains the component and its props
  callbackId: null, // Serializable ID referencing the external resolve function
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal(state, action) {
      state.isOpen = true;
      state.component = action.payload.component;
      state.modalProps = action.payload.props;
      state.url = action.payload.url;
      state.callbackId = action.payload.callbackId || null;
    },
    closeModal(state) {
      // Execute callback with null/cancelled result before clearing
      if (state.callbackId) {
        executeModalCallback(state.callbackId, { success: false, cancelled: true });
      }
      state.isOpen = false;
      state.component = null;
      state.modalProps = {};
      state.callbackId = null;
      state.url = null;
    },
    resolveModal(state, action) {
      if (state.callbackId) {
        executeModalCallback(state.callbackId, action.payload);
      }
      state.isOpen = false;
      state.url = null;
      state.component = null;
      state.modalProps = {};
      state.callbackId = null;
    },
  },
});

export const { openModal, closeModal, resolveModal } = modalSlice.actions;
export const selectModal = (state) => state.modal;

export default modalSlice.reducer;
