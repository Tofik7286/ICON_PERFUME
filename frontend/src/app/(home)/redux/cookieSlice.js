import { createSlice } from "@reduxjs/toolkit";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const initialState = {
  cookieAccept: null,
  visible: true,
}

const expiryDate = new Date();
expiryDate.setDate(expiryDate.getDate() + 10);

const cookieSlice = createSlice({
  name: "Cookie",
  initialState,
  reducers: {
    acceptCookie: (state, action) => {

      // Update the Consent of Cookies
      state.cookieAccept = true;
      cookies.set("cookie_consent", "accepted", {
        expires: expiryDate,
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      })
      state.visible = false
    },
    rejectCookie: (state, action) => {
      state.cookieAccept = false;
      cookies.set("cookie_consent", "rejected", {
        expires: expiryDate,
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      })
      state.visible = false
    },
    openPopup: (state, action) => {
      cookies.remove('cookie_consent')
      state.visible = true;
    },
    closePopup: (state, action) => {
      state.visible = false
    }
  },
});

export const { acceptCookie, rejectCookie, openPopup, closePopup } = cookieSlice.actions;
export default cookieSlice.reducer;