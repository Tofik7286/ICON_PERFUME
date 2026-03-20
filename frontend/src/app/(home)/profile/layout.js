'use client'
// my-profile/layout.js
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Breadcrumb from '../components/BreadCrumb';
import styles from '@/app/(home)/styles/Profile.module.css'
import { useDispatch } from 'react-redux';
import { deleteUser, setUser } from '../redux/userSlice';
import Cookies from 'universal-cookie';
import { addToast } from '../redux/toastSlice';
import { loader } from '../redux/loaderSlice';
import { setCartItems, setTotal } from '../redux/cartSlice';
import { setWishListItem } from '../redux/wishListSlice';
import { clearCheckout } from '../redux/checkoutSlice';
import { useState } from 'react';
import { GoPerson } from "react-icons/go";
import { IoLocationOutline } from "react-icons/io5";
import { AiOutlineUserDelete } from "react-icons/ai";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { BiLogOutCircle } from "react-icons/bi";

import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { openConfirmModal } from '../redux/confirmSlice';
import secureLocalStorage from 'react-secure-storage';
import axios from 'axios';

export default function ProfileLayout({ children }) {

  const pathname = usePathname();
  const dispatch = useDispatch();

  const url = process.env.NEXT_PUBLIC_API_URL
  const cookies = new Cookies();
  const token = cookies.get('is_logged_in');
  const router = useRouter();

  const Logout = async () => {
    try {
      dispatch(loader(true));
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/logout/`, {
        withCredentials: true
      });
      dispatch(addToast({ message: response.data.message, type: "success" }));
    } catch (error) {
      console.error(error);
      dispatch(addToast({ message: "Logged out locally.", type: 'info' }));
    } finally {
      // GUARANTEED CLEANUP — runs whether API succeeds or fails
      cookies.remove('checkout_hashData', { path: '/', sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
      cookies.remove('checkout_source', { path: '/', sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
      cookies.remove('payment_token', { path: '/', sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
      cookies.remove('is_logged_in', { path: '/' });
      secureLocalStorage.removeItem("cart_hashData");
      secureLocalStorage.removeItem("checkout_hashData");
      dispatch(setUser(null));
      dispatch(setCartItems([]));
      dispatch(setWishListItem([]));
      dispatch(setTotal(0));
      dispatch(clearCheckout());
      router.push('/');
      dispatch(loader(false));
    }
  };

  const handleConfirm = () => {
    dispatch(openConfirmModal({
      message: {
        title: "Delete Account",
        description: "Are You Sure You want Delete Your Account ?"
      },
      onConfirm: async () => {
        try {
          dispatch(loader(true))
          const response = await fetch(`${url}/profile/`, {credentials:"include", method: 'DELETE' })
          const json = await response.json();
          if (json.success) {
            dispatch(addToast({ message: json.message, type: 'success' }));
            // token cookie is httponly — backend response already deletes it
            cookies.remove('checkout_hashData', { path: '/', sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
            cookies.remove('checkout_source', { path: '/', sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
            cookies.remove('payment_token', { path: '/', sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
            cookies.remove('is_logged_in', { path: '/' });
            secureLocalStorage.removeItem("cart_hashData");
            secureLocalStorage.removeItem("checkout_hashData");
            dispatch(setUser(null));
            dispatch(setCartItems([]));
            dispatch(setWishListItem([]));
            dispatch(setTotal(0));
            dispatch(clearCheckout());
            router.push('/');
          } else {
            dispatch(addToast({ message: json.message, type: 'error' }));
            return;
          }
        } catch (error) {
          dispatch(addToast({ message: error.message, type: 'error' }));
        } finally {
          dispatch(loader(false))
        }
      }
    }))
  }

  return (
    <>
      <div className="container-fluid my-5 padd-x py-5 d-flex align-items-center justify-content-center">
        <div className="row h-100 w-100">
         
          {/* Sidebar */}
          <div className={`col-lg-3 ${styles.sidebar} mb-lg-0 mb-3`}>
            <ul className="list-unstyled m-10">
              <li className="mb-1 mt-2 me-1">
                <Link href="/profile" className={pathname === '/profile/' ? styles.active : ''}>
                  <GoPerson /> My Profile</Link>
              </li>
              <li className="mb-1 me-1">
                <Link href="/profile/addresses" className={pathname === '/profile/addresses/' ? styles.active : ''}>
                  <IoLocationOutline /> Addresses</Link>
              </li>
              <li className="mb-1 me-1" onClick={handleConfirm} style={{ cursor: "pointer" }}>
                <a><AiOutlineUserDelete /> Delete Your Account</a>
              </li>
              <li className="mb-1 me-1">
                <Link href="/profile/orders" className={pathname === '/profile/orders' ? styles.active : ''}>
                  <HiOutlineShoppingBag />  My Orders</Link>
              </li>
              <li className="mb-1 me-1">
                <a>
                  <BiLogOutCircle />
                  <span
                    role="button"
                    className=" cursor-pointer"
                    onClick={Logout} // Show modal on click
                  >
                    Logout
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="col-lg-9 d-flex justify-content-center px-lg-2 px-0">
            {children}
          </div>

        </div>
      </div>
    </>
  );
}
