'use client'
import React from 'react'
import styles from '@/app/(home)/styles/login.module.css'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import { useDispatch } from 'react-redux'
import { addToast } from '../../redux/toastSlice'
import { loader } from '../../redux/loaderSlice'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation';

const ForgotPassword = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const dispatch = useDispatch()
    const url = process.env.NEXT_PUBLIC_API_URL;
    const params = useSearchParams();
    const redirect = params.get("redirect") ? params.get("redirect") : "/"

    const forgotPassword = async (data) => {
        try {
            dispatch(loader(true))

            const response = await fetch(`${url}/forgot-password/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const json = await response.json();

            if (json.success) {
                dispatch(addToast({ message: json.message, type: 'success' }))
                reset()
            } else {
                dispatch(addToast({ message: json.message, type: 'error' }))
            }
        } catch (error) {

        } finally {
            dispatch(loader(false));
        }
    }

    return (
        <div className={`${styles.login} padd-x`}>
            <div className="row h-100 align-items-center">
                <div className="col-lg-6 col-12">
                    <div className={styles.login_container}>
                        <form onSubmit={handleSubmit(forgotPassword)}>
                            <div className="input-field">
                                <label htmlFor="email">Enter Your Email</label>
                                <div className="input">
                                    <input
                                        type="text"
                                        placeholder="Enter your Email"
                                        id="contact"
                                        {...register('email', {
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
                                {errors.email && (
                                    <p className="text-red-500 text-xs">{errors.email.message}</p>
                                )}
                            </div>
                            <button type='submit' className={styles.button}>Send Email</button>
                            <p className={`${styles.para} mt-2`}>Already Have an Account? <Link href={`/login/?redirect=${redirect}`}>Login</Link></p>
                        </form>
                    </div>
                </div>
                <div className="col-lg-6 col-12">
                    <div className={styles.image}>
                        <Image src="/images/Log In banner.png" className='img-fluid' alt="Forgot password banner - Icon Perfumes" width={1000} height={1000} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
