'use client'
import React from 'react'
import styles from '@/app/(home)/styles/login.module.css'
import Link from 'next/link'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
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
    const [passwordVisible, setPasswordVisible] = useState(false);
    const url = process.env.NEXT_PUBLIC_API_URL
    const router = useRouter();
    const dispatch = useDispatch();
    const cookies = new Cookies();
    const [Error, setError] = useState('');
    const { cart } = useSelector(selectCart);
    const { wishList } = useSelector(selectWishList);
    const params = useSearchParams()
    const redirect = params.get("redirect") ? params.get("redirect") : "/"

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

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
                    phone_number: data.contact,
                    password: data.password,
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
                await router.push(redirect);
            };

            if (json.success) {
                await handleSuccessfulLogin(json.message);
            } else if (json.verify === false) {
                dispatch(loader(false));

                dispatch(addToast({ message: json.message, type: 'warning' }));

                const modalPromise = new Promise((resolve) => {
                    const callbackId = registerModalCallback(resolve);
                    dispatch(openModal({
                        component: 'OTP',
                        props: { email: json.email, masked_email: json.masked_email },
                        url: `${url}/verify-email/`,
                        callbackId,
                    }));
                });

                const modalResponse = await modalPromise;
                if (modalResponse.success) {
                    await handleSuccessfulLogin(modalResponse.message);
                }
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
                        <p className={styles.para}>Access your personal account by logging in.</p>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="input-field">
                                <label htmlFor="email">Email Address Or Phone number</label>
                                <div className="input">
                                    <input
                                        type="text"
                                        placeholder="Enter your Email or Phone Number"
                                        id="contact"
                                        {...register('contact', {
                                            required: 'Email or Phone Number is required',
                                            validate: value => {
                                                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                                const phonePattern = /^[0-9]{10}$/; // Adjust this for international numbers if needed
                                                if (!emailPattern.test(value) && !phonePattern.test(value)) {
                                                    return 'Enter a valid email or phone number';
                                                }
                                            },
                                        })}
                                    />
                                </div>
                                {errors.contact && (
                                    <p className="text-red-500 text-xs">{errors.contact.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="input-field">
                                <label htmlFor="password">Password</label>
                                <div className="input d-flex align-items-center">
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        placeholder="Enter your Password"
                                        id="password"
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 6,
                                                message: 'Password must be at least 6 characters',
                                            },
                                        })}
                                    />
                                    {passwordVisible ? <FaRegEye onClick={togglePasswordVisibility} /> : <FaRegEyeSlash onClick={togglePasswordVisibility} />}
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs">{errors.password.message}</p>
                                )}
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className=""></div>
                                <Link href="/login/forgot-password/" className={styles.forgot}>Forgot Password</Link>
                            </div>
                            {Error && (
                                <p className="text-red-500 text-xs">{Error}</p>
                            )}
                            <button type='submit' className={`${styles.button} shine-button`}>Log In</button>
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
