import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  redirectTo: null, // Store redirection URL
};

const redirectSlice = createSlice({
  name: "redirect",
  initialState,
  reducers: {
    setRedirect: (state, action) => {
      state.redirectTo = action.payload; // Set redirect URL
    },
    clearRedirect: (state) => {
      state.redirectTo = null; // Clear redirect state
    },
  },
});

export const { setRedirect, clearRedirect } = redirectSlice.actions;
export default redirectSlice.reducer;
