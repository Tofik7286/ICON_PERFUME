'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styles from '@/app/(home)/styles/Profile.module.css';
import { fetchUser, selectUser, setUser } from '../redux/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Cookies from 'universal-cookie';
import { openModal, registerModalCallback } from '../redux/modalSlice';
import { loader } from '../redux/loaderSlice';
import { addToast } from '../redux/toastSlice';
import { CountryDropdown } from '@/components/ui/country-dropdown';

const Profile = () => {
    const dispatch = useDispatch();
    const { user, status, error } = useSelector(selectUser);
    const router = useRouter();

    // Initialize react-hook-form
    const url = process.env.NEXT_PUBLIC_API_URL
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    const [Error, setError] = useState('');

    useEffect(() => {

        // Populate the form with fetched user data
        if (user) {

            setValue('name', user.name || '');
            const phoneNumber = user?.phone_number || ""; // Ensure it's defined
            setValue('phone_number', phoneNumber);
            setValue('username', user.username || '');
            setValue('email', user.email || '');
        }
    }, [user]);

    const onSubmit = async (data) => {
        try {
            setError('')
            dispatch(loader(true))
            data.phone_number = `${data.phone_number}`
            const response = await fetch(url + `/profile/`, {
                method: 'PUT',
                credentials:"include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            const json = await response.json();

            if (json.success) {
                dispatch(loader(false));
                dispatch(addToast({ message: json.message, type: 'success' }))
                const modalPromise = new Promise((resolve) => {
                    const callbackId = registerModalCallback(resolve);
                    dispatch(openModal({
                        component: 'OTP',
                        props: { email: data.email, masked_email: json.masked_email, data: data },
                        url: `${url}/verify-profile-otp/`,
                        callbackId,
                    }));
                });
                
                const modalResponse = await modalPromise;

                if (modalResponse.success) {
                    dispatch(addToast({ message: modalResponse.message, type: 'success' }))
                    setValue('name', modalResponse.updated_data?.data.name || user.name);
                    const phoneNumber =
                    modalResponse?.updated_data?.data?.phone_number ||
                    user?.phone_number || 
                    "";

                    const formattedPhoneNumber = phoneNumber ;

                    setValue('phone_number', formattedPhoneNumber);
                    setValue('username', modalResponse.updated_data.data.username || user.username);
                    setValue('email', modalResponse.updated_data.email || user.email);
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
        <form className={styles.form_container} onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
                <h4 className={`${styles.heading} !font-[500] mb-3`}>Edit Profile</h4>
                {/* Full Name */}
                <div className="col-md-6">
                    <div className="input-field">
                        <label htmlFor="name">Full Name</label>
                        <div className="input">
                            <input
                                id="name"
                                type="text"
                                {...register('name',
                                    {
                                        required: 'Full name is required',
                                        maxLength: {
                                            value: 35,
                                            message: 'Full Name must not exceed 35 characters'
                                        },
                                    }
                                )}
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>
                </div>

                {/* Phone Number */}
                <div className="col-md-6">
                    <div className="input-field">
                        <label htmlFor="phone_number">Phone No</label>
                        <div className="input" >
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
                                {...register('phone_number', {
                                    required: 'Phone Number is required',
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: 'Phone number must be 10 digits',
                                    },
                                })}
                            />
                        </div>
                        {errors.phone_number && (
                            <p className="text-red-500 text-xs">{errors.phone_number.message}</p>
                        )}
                    </div>
                </div>

                {/* Username */}
                <div className="col-md-6">
                    <div className="input-field">
                        <label htmlFor="username">Username</label>
                        <div className="input">
                            <input
                                id="username"
                                type="text"
                                {...register('username', {
                                    required: 'Username is required',
                                    maxLength: {
                                        value: 35,
                                        message: 'Full Name must not exceed 35 characters'
                                    },
                                })}
                            />
                        </div>
                        {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
                    </div>
                </div>

                {/* Email */}
                <div className="col-md-6">
                    <div className="input-field">
                        <label htmlFor="email">Email</label>
                        <div className="input">
                            <input
                                id="email"
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Invalid email address',
                                    },
                                })}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                    </div>
                </div>
                {Error && <p className="text-red-500 text-xs">{Error}</p>}
                {/* Buttons */}
                <div className={styles.button_container}>
                    <button type="submit" className={`${styles.button} shine-button`}>
                        Save Changes
                    </button>
                </div>
            </div>
        </form>
    );
};

export default Profile;
