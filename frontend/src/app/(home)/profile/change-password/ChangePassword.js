'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import styles from '@/app/(home)/styles/Profile.module.css';
import Cookies from 'universal-cookie';
import { addToast } from '../../redux/toastSlice';
import { useForm } from 'react-hook-form';
import { loader } from '../../redux/loaderSlice';

const ChangePassword = () => {

    const url = process.env.NEXT_PUBLIC_API_URL
    const cookies = new Cookies();
    const token = cookies.get('is_logged_in');
    const dispatch = useDispatch();

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            dispatch(addToast({ message: 'New password and confirm password do not match!', type: 'error' }));
            return;
        }

        try {
            dispatch(loader(true));
            const response = await fetch(`${url}/change-password/`, {
                credentials:"include",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    old_password: data.oldPassword,
                    new_password: data.newPassword
                })
            });
            const json = await response.json();
            if (json.success) {
                dispatch(addToast({ message: json.message, type: 'success' }));
                reset()
            }
            else {
                dispatch(addToast({ message: json.message, type: 'error' }));
            }
        } catch (error) {
            dispatch(addToast({ message: 'Something went wrong. Please try again.', type: 'error' }));
        } finally {
            dispatch(loader(false))
        }
    }

    return (
        <form className={styles.form_container} onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
                <h4 className={`${styles.heading} !font-[500] `}>Change Password</h4>

                {/* Old Password */}
                <div className="col-md-6">
                    <div className="input-field">
                        <label htmlFor="oldPassword">Old Password</label>
                        <div className="input">
                            <input
                                {...register('oldPassword', { required: 'Old password is required' })}
                                type="password"
                                placeholder="Enter your old password"
                                id="oldPassword"
                            />
                            {errors.oldPassword && <p className={styles.error}>{errors.oldPassword.message}</p>}
                        </div>
                    </div>
                </div>

                {/* New Password */}
                <div className="col-md-6">
                    <div className="input-field">
                        <label htmlFor="newPassword">New Password</label>
                        <div className="input">
                            <input
                                {...register('newPassword', {
                                    required: 'New password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    }
                                })}
                                type="password" 
                                placeholder="Enter your new password"
                                id="newPassword"
                            />
                            {errors.newPassword && <p className={styles.error}>{errors.newPassword.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="col-md-6">
                    <div className="input-field">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="input">
                            <input
                                {...register('confirmPassword', { required: 'Confirm password is required' })}
                                type="password"
                                placeholder="Confirm your new password"
                                id="confirmPassword"
                            />
                            {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.button_container}>
                <button type="button" className={styles.cancel_button} onClick={() => reset()}>
                    Cancel
                </button>
                <button type="submit" className={`${styles.button} shine-button`} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default ChangePassword;
