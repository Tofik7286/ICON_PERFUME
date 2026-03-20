'use client'
import React from 'react'
import styles from '@/app/(home)/styles/login.module.css'
import Link from 'next/link'
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'universal-cookie';
import { useDispatch, useSelector } from 'react-redux';

import { addToast } from '../redux/toastSlice';
import { loader } from '../redux/loaderSlice';
import { fetchUser, setUser } from '../redux/userSlice';
import { fetchCart } from '../redux/cartSlice';
import { fetchWishList, selectWishList } from '../redux/wishListSlice';
import { openModal, registerModalCallback } from '../redux/modalSlice';
import Image from 'next/image';
import { openPopup } from '../redux/cookieSlice';
import { selectCart } from "../redux/cartSlice";
import secureLocalStorage from 'react-secure-storage';

const Login = () => {

    const { register, handleSubmit, formState: { errors } } = useForm();
    const url = process.env.NEXT_PUBLIC_API_URL
    const router = useRouter();
    const dispatch = useDispatch();
    const cookies = new Cookies();
    const [Error, setError] = useState('');
    const { cart } = useSelector(selectCart);
    const { wishList } = useSelector(selectWishList);
    const params = useSearchParams()
    const redirect = params.get("redirect") ? params.get("redirect") : "/"

    const onSubmit = async (data) => {

        const consent = cookies.get("cookie_consent");
        if (consent === "rejected") {
            dispatch(openPopup())
            return
        }

        try {
            setError('')
            dispatch(loader(true));
            const response = await fetch(`${url}/login/`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials:"include",
                body: JSON.stringify({
                    email: data.email,
                    cart_data: cart,
                    wishlist_data: wishList 
                }),
            });

            const json = await response.json();

            const handleSuccessfulLogin = async (message) => {
                dispatch(addToast({ message, type: 'success' }));
                secureLocalStorage.removeItem("cart_hashData")
                secureLocalStorage.removeItem("wishList_hashData")
                dispatch(fetchUser());
                dispatch(fetchCart());
                dispatch(fetchWishList());
                await router.push('/');
            };

            if (json.success && json.requires_otp) {
                dispatch(loader(false));
                dispatch(addToast({ message: json.message, type: 'success' }));

                const modalPromise = new Promise((resolve) => {
                    const callbackId = registerModalCallback(resolve);
                    dispatch(openModal({
                        component: 'OTP',
                        props: {
                            email: json.email,
                            masked_email: json.masked_email,
                            cart_data: cart,
                            wishlist_data: wishList,
                            flow: 'login',
                        },
                        url: `${url}/verify-email/`,
                        callbackId,
                    }));
                });

                const modalResponse = await modalPromise;
                if (modalResponse.success) {
                    await handleSuccessfulLogin(modalResponse.message);
                }
            } else if (json.success) {
                await handleSuccessfulLogin(json.message);
            } else {
                setError(json.message);

            }
        } catch (error) {
            console.error("Internal server error", error);
            setError(error.message);

        } finally {
            dispatch(loader(false));
        }
    };

    return (
        <div className={`${styles.login} padd-x`}>
            <div className="row h-100 align-items-center">
                <div className="col-lg-6 col-12">
                    <div className={styles.login_container}>
                        <div className='heading !my-0'>
                            <h1 className='!w-full !font-[500]'>Welcome Back</h1>
                        </div>
                        <p className={styles.para}>Enter your email and sign in with a verification code.</p>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="input-field">
                                <label htmlFor="email">Email Address</label>
                                <div className="input">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        id="email"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: 'Enter a valid email address',
                                            },
                                        })}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-xs">{errors.email.message}</p>
                                )}
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className=""></div>
                                <Link href="/login/forgot-password/" className={styles.forgot}>Forgot Password</Link>
                            </div>
                            {Error && (
                                <p className="text-red-500 text-xs">{Error}</p>
                            )}
                            <button type='submit' className={`${styles.button} shine-button`}>Send Code</button>
                        </form>
                        <p className={styles.para}>Don&apos;t have an account? <Link href={`/sign-up/?redirect=${redirect}`}>Sign up</Link></p>
                    </div>
                </div>
                <div className="col-lg-6 col-12">
                    <div className={styles.image}>
                        <Image src="/images/Log In banner.png" className='img-fluid' alt="Login banner - Icon Perfumes" width={1000} height={1000} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
