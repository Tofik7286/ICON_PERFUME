"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useEffect, useState } from "react";
import { addToast } from "../redux/toastSlice";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "universal-cookie";
import CryptoJS from "crypto-js";
import styles from "@/app/(home)/styles/payment_success.module.css";
import { fetchCart } from "../redux/cartSlice";
import Link from "next/link";

export default function PaymentSuccess() {
  const [status, setStatus] = useState("Verifying...");
  const params = useSearchParams();
  const txnid = params.get("txnid");
  const payment_status = params.get("status");
  const hash = params.get("hash");
  const cookies = new Cookies();
  const token = cookies.get("is_logged_in");
  const source = params.get("source");
  const url = process.env.NEXT_PUBLIC_API_URL;
  const dispatch = useDispatch();
  const [updatedData, setUpdatedData] = useState(null);
  const [success, setSuccess] = useState(null);

  const router = useRouter();
  const SECRET_KEY = process.env.NEXT_PUBLIC_COOKIE_SECRET;

  const decryptData = (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error("Decryption failed:", error);
      return [];
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      let encryptedData = sessionStorage.getItem("checkout_details");
      const data = decryptData(encryptedData);
      if (data) {
        setUpdatedData(data);
      }
    }
  }, []);

  const verifyPayment = async () => {
    try {
      if (payment_status === "failed") {
        setSuccess(false);
        setStatus("Payment verification failed.");
        return;
      }
      if (!updatedData) {
        setSuccess(false);
        setStatus("Session data missing. Please contact support.");
        return;
      }
      updatedData.txnid = txnid;
      updatedData.status = payment_status;
      updatedData.hash = hash;
      const response = await fetch(
        url +
          `/verify-payment/?source=${
            updatedData && updatedData.source
          }`,
        {
          method: "POST",
          body: JSON.stringify(updatedData),
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setStatus("Payment Successful! Your order is confirmed.");
        dispatch(addToast({ message: data.message, type: "success" }));
        sessionStorage.removeItem("checkout_details");
        cookies.remove("checkout_source");
        cookies.remove("checkout_hashData");
        cookies.remove("payment_token");
        dispatch(fetchCart());
        setTimeout(() => {
          router.replace(`/order-confirm?order_id=${data.order_id}`, {
            shallow: true,
          });
        }, 2000);
      } else {
        setSuccess(false);
        setStatus("Payment verification failed.");
      }
    } catch (error) {

      setSuccess(false);
      setStatus("Error verifying payment.");
    }
  };

  useEffect(() => {
    if (payment_status && updatedData) {
      verifyPayment();
    }
  }, [payment_status, updatedData]);

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        {/* Conditionally render tick, loading, or error */}
        <div className={styles.iconContainer}>
          {success === null && (
            <div className={styles.loader}></div> // Show loading animation
          )}
          {success === true && (
            <svg
              className={styles.checkmark}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                className={styles.checkmark__circle}
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className={styles.checkmark__check}
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          )}
          {success === false && (
            <svg
              className={styles.crossmark}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                className={styles.crossmark__circle}
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className={styles.crossmark__line}
                d="M16 16 L36 36 M36 16 L16 36"
              />
            </svg>
          )}
        </div>

        {/* Status Message */}
        <h1
          className={`${styles.successTitle} ${
            success === null ? "" : success ? styles.success : styles.error
          }`}
        >
          {success === null
            ? "Processing..."
            : success
            ? "Success!"
            : "Payment Failed"}
        </h1>

        {success === null && (
          <p className="!text-sm text-gray-600">
            Please stay on this page while we process your payment...
          </p>
        )}
        {/* Message based on status */}
        {success === true && (
          <p className={styles.successMessage}>
            Thank you for your purchase. Your payment has been processed
            successfully.
          </p>
        )}
        {success === false && (
          <>
            <p className={styles.errorMessage}>
              Oops! Your payment was not successful. Please try again.
            </p>
            <Link href="/" className="button2 mt-3 underline">
              Got to Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
