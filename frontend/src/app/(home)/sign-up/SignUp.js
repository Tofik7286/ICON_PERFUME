'use client'
import React, { useState } from 'react';
import styles from '@/app/(home)/styles/login.module.css';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'universal-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../redux/userSlice';
import { loader } from '../redux/loaderSlice';
import { openModal, registerModalCallback } from '../redux/modalSlice';
import { addToast } from '../redux/toastSlice';
import Image from 'next/image';
import { openPopup } from '../redux/cookieSlice';
import { selectCart, fetchCart } from "../redux/cartSlice";
import secureLocalStorage from 'react-secure-storage';
import { selectWishList, fetchWishList } from '../redux/wishListSlice';

const SignUp = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const url = process.env.NEXT_PUBLIC_API_URL
    const router = useRouter();
    const dispatch = useDispatch();
    const cookies = new Cookies();
    const [Error, setError] = useState('');
    const { cart } = useSelector(selectCart);
    const params = useSearchParams()
    const redirect = params.get("redirect") ? params.get("redirect") : "/"
    const { wishList } = useSelector(selectWishList);

    const onSubmit = async (data) => {
        const consent = cookies.get("cookie_consent");
        if (consent === "rejected") {
            dispatch(openPopup())
            return
        }

        try {
            setError('')
            dispatch(loader(true))

            const payload = {
                email: data.email,
                cart_data: cart,
                wishlist_data: wishList,
            }

            const response = await fetch(`${url}/signup/`, {
                method: 'POST',
                credentials:'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            const json = await response.json();

            if (json.success) {
                if (json.requires_otp === false) {
                    dispatch(addToast({ message: json.message || "Account created successfully", type: 'success' }));
                    secureLocalStorage.removeItem("cart_hashData")
                    secureLocalStorage.removeItem("wishList_hashData")
                    dispatch(fetchUser());
                    dispatch(fetchCart());
                    dispatch(fetchWishList())
                    router.push(redirect)
                    return
                }

                const modalPromise = new Promise((resolve) => {
                    const callbackId = registerModalCallback(resolve);
                    dispatch(openModal({
                        component: 'OTP',
                        props: {
                            cart_data: cart,
                            wishlist_data: wishList,
                            flow: 'signup',
                            email: json.email,
                            masked_email: json.masked_email,
                        },
                        url: `${url}/verify-email/`,
                        callbackId,
                    }));
                });

                dispatch(addToast({ message: json.message, type: 'success' }));
                dispatch(loader(false));
                const modalRes = await modalPromise;
                if (modalRes.success) {
                    secureLocalStorage.removeItem("cart_hashData")
                    secureLocalStorage.removeItem("wishList_hashData")
                    dispatch(addToast({ message: modalRes.message, type: 'success' }));
                    dispatch(fetchUser());
                    dispatch(fetchCart());
                    dispatch(fetchWishList())
                    router.push('/profile/')
                }

            } else {
                setError(json.message);
            }
        } catch (error) {

            setError(error.message);
        } finally {
            dispatch(loader(false))
        }
    };

    

    return (
        <div className={`${styles.login} padd-x`}>
            <div className="row h-100 align-items-center">
                <div className="col-lg-6 col-12">
                    <div className={`${styles.login_container} py-4`}>
                        <h1>Create Account</h1>
                        <p className={styles.para}>Enter your email to create account and verify with code.</p>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Email Field */}
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
                                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                                )}
                            </div>
                            {Error && (
                                <p className="text-red-500 text-sm">{Error}</p>
                            )}
                            <button type="submit" className={`${styles.button} shine-button`}>Sign Up</button>
                        </form>
                        <p className={styles.para}>Already Have an Account? <Link href={`/login?redirect=${redirect}`}>Login</Link></p>
                    </div>
                </div>
                <div className="col-lg-6 col-12">
                    <div className={styles.image}>
                        <Image src="/images/Log In banner.png" className="img-fluid" alt="Sign up banner - Icon Perfumes" width={1000} height={1000} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
