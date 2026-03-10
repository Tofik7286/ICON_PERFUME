'use client'
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeToast } from "../redux/toastSlice";
import Toast from "./Toast";

const ToastsContainer = () => {
  const toasts = useSelector((state) => state.toasts);
  const dispatch = useDispatch();

  return (
    <div className="toasts-container">
      {toasts.map((toast, key) => (
        <Toast key={key} {...toast} onDismiss={(id) => {dispatch(removeToast(id))}} />
      ))}
    </div>
  );
};

export default ToastsContainer;
