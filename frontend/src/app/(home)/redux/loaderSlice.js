import { createSlice } from "@reduxjs/toolkit";

const loaderSlice = createSlice({
  name: "loader",
  initialState: {
    open: false
  },
  reducers: {
    loader: (state, action) => {
      state.open = action.payload
    },
  },
});

export const { loader } = loaderSlice.actions;
export default loaderSlice.reducer;
