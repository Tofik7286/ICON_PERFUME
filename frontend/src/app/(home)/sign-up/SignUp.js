'use client'
import React, { useState } from 'react';
import styles from '@/app/(home)/styles/login.module.css';
import Link from 'next/link';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'universal-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, setUser } from '../redux/userSlice';
import { loader } from '../redux/loaderSlice';
import { openModal, registerModalCallback } from '../redux/modalSlice';
import { addToast } from '../redux/toastSlice';
import Image from 'next/image';
import { openPopup } from '../redux/cookieSlice';
import { selectCart, fetchCart, syncLocalCartWithDB } from "../redux/cartSlice";
import secureLocalStorage from 'react-secure-storage';
import { selectWishList, fetchWishList } from '../redux/wishListSlice';
import { CountryDropdown } from '@/components/ui/country-dropdown';

const SignUp = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const url = process.env.NEXT_PUBLIC_API_URL
    const router = useRouter();
    const dispatch = useDispatch();
    const [Error, setError] = useState('');
    const { status, error, openCart, cart, total } = useSelector(selectCart);
    const params = useSearchParams()
    const redirect = params.get("redirect") ? params.get("redirect") : "/"
    const { wishList } = useSelector(selectWishList);
    

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const onSubmit = async (data) => {
        try {
            setError('')
            dispatch(loader(true))
            const response = await fetch(`${url}/signup/`, {
                method: 'POST',
                credentials:'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: data.name, email: data.email, phone_number: `${data.phone}`, password: data.password })
            })
            const json = await response.json();

            data = {...data, cart_data: cart, wishlist_data: wishList}

            if (json.success) {
                dispatch(loader(false))
                const modalPromise = new Promise((resolve) => {
                    const callbackId = registerModalCallback(resolve);
                    dispatch(openModal({
                        component: 'OTP',
                        props: {...data, ...json}, // Pass any props required for the modal
                        url: `${url}/verify-email/`,
                        callbackId,
                    }));
                });
                secureLocalStorage.removeItem("cart_hashData")
                secureLocalStorage.removeItem("wishList_hashData")
                dispatch(addToast({ message: "Account Created Successfully", type: 'success' }));
                dispatch(addToast({ message: json.message, type: 'success' }));
                const modalRes = await modalPromise;
                if (modalRes.success) {
                    dispatch(addToast({ message: modalRes.message, type: 'success' }));
                 
                    dispatch(fetchUser());
                    dispatch(fetchCart());
                    dispatch(syncLocalCartWithDB()); // LOGIN-TIME SYNC: Migrate guest cart to DB
                    dispatch(fetchWishList())
                    router.push(redirect)
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
                        <p className={styles.para}>Create your personal account.</p>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Username Field */}
                            <div className="input-field">
                                <label htmlFor="username">Full Name</label>
                                <div className="input">
                                    <input
                                        type="text"
                                        placeholder="Enter Full Name"
                                        id="username"
                                        {...register('name', {
                                            required: 'Full Name is required',
                                            minLength: {
                                                value: 3,
                                                message: 'Full Name must be at least 3 characters'
                                            },
                                            maxLength: {
                                                value: 35,
                                                message: 'Full Name must not exceed 35 characters'
                                            },
                                        })}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-red-500 text-sm">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div className="input-field">
                                <label htmlFor="email">Email Address</label>
                                <div className="input">
                                    <input
                                        type="email"
                                        placeholder="Enter your Email"
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

                            {/* Phone Field */}
                            <div className="input-field">
                                <label htmlFor="phone">Phone</label>
                                <div className="input">
                                    {/* <CountryDropdown
                                        placeholder="Select country"
                                        defaultValue={country}
                                        onChange={(country) => {setCountry(country)}}
                                        slim
                                    /> */}
                                    <input
                                        type="text"
                                        placeholder="Enter your Phone Number"
                                        id="phone"
                                        {...register('phone', {
                                            required: 'Phone Number is required',
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: 'Phone number must be 10 digits',
                                            },
                                        })}
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="text-red-500 text-sm">{errors.phone.message}</p>
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
                                    {passwordVisible ? <FaRegEye onClick={togglePasswordVisibility} /> :  <FaRegEyeSlash onClick={togglePasswordVisibility} />}
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-sm">{errors.password.message}</p>
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
