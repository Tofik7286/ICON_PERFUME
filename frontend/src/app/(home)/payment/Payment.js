'use client'
import React, { useEffect, useState } from 'react';
import checkout from '@/app/(home)/styles/checkout.module.css';
import styles from '@/app/(home)/styles/modal.module.css';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, selectModal } from '../redux/modalSlice';
import { addToast } from '../redux/toastSlice';
import { useRouter } from 'next/navigation';
import { loader } from '../redux/loaderSlice';
import Cookies from 'universal-cookie';
import CryptoJS from "crypto-js";
import { fetchCart, setCartItems } from '../redux/cartSlice';
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const Payment = () => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const router = useRouter()
    const url = process.env.NEXT_PUBLIC_API_URL
    const cookies = new Cookies()
    const [Error, setError] = useState('');
    const [updatedData, setUpdatedData] = useState(null);

    const SECRET_KEY = process.env.NEXT_PUBLIC_COOKIE_SECRET;
    // Utility: Decrypt data
    const decryptData = (encryptedData) => {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        } catch (error) {
            console.error('Decryption failed:', error);
            return [];
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            let encryptedData = sessionStorage.getItem('checkout_details')
            const data = decryptData(encryptedData);
            if (data) {
                setUpdatedData(data)
            }

        }
    }, [])
    

    const onSubmit = async (data) => {
        const processedData = {
            ...data,
            card_number: data.card_number.replace(/\s/g, ''), // Remove spaces
        };
        try {
            // Trigger loader to show loading state
            dispatch(loader(true));
            // Create a new object to avoid mutating modalProps directly

            updatedData.card_details = processedData

            const response = await fetch(`${url}/checkout/?source=${updatedData.source}`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            })

            const json = await response.json()

            if (json.success) {
                dispatch(addToast({ message: json.message, type: 'success' }))
                sessionStorage.removeItem('checkout_details')
                dispatch(fetchCart())
                cookies.remove("checkout_source")
                cookies.remove("payment_token")
                router.replace(`/order-confirm?order_id=${json.order_id}`)
            } else {

                setError(json.message.match(/\[(.*?)\]/)?.[1] || json.message);
            }

        } catch (error) {
            setError(error.message)
        } finally {
            dispatch(loader(false));
        }
    };

    // Format card number with spaces or dashes after every 4 digits
    const handleCardNumberInput = (e) => {
        // Remove non-numeric characters
        let input = e.target.value.replace(/\D/g, '');

        // Format input with spaces after every 4 digits
        const formatted = input.replace(/(\d{4})(?=\d)/g, '$1 ');

        // Update the value in your form
        setValue('card_number', formatted, { shouldValidate: true });
    };

    return (
        <div className={`d-flex align-items-start justify-content-center pt-5 ${checkout.payment}`} style={{ height: "100vh" }}>
            <div className='px-4' style={{ maxWidth: '500px !important' }}>
                <h3 className='mb-2'>Add Account Details</h3>
                <form onSubmit={handleSubmit(onSubmit)} className='w-100'>
                    <div className="input-field">
                        <label htmlFor="card_number">Card Number</label>
                        <div className="input">
                            <input
                                autoComplete="cc-number"
                                id="card_number"
                                name="card_number"
                                type="tel"
                                placeholder="0000 0000 0000 0000"
                                maxLength={19} // Allow up to 16 digits + 3 spaces
                                {...register('card_number', {
                                    required: 'Card Number is required',
                                    validate: (value) => {
                                        // Remove spaces for validation
                                        const rawValue = value.replace(/\s/g, '');
                                        if (!/^\d{16}$/.test(rawValue)) {
                                            return 'Card Number must be exactly 16 digits.';
                                        }
                                        return true;
                                    },
                                })}
                                onChange={handleCardNumberInput} // Handle input change
                            />
                        </div>
                        {errors.card_number && <p className="text-red-500 text-xs">{errors.card_number.message}</p>}
                    </div>
                    <div className="input-field">
                        <label htmlFor="card_name">Card Name</label>
                        <div className="input">
                            <input
                                type="text"
                                placeholder="Enter your Card Name"
                                id="card_name"
                                {...register('card_name', {
                                    required: 'Card Name is required',
                                    validate: value =>
                                        value.trim().split(' ').length >= 2 || 'Card Name must have at least two words'
                                })}
                            />
                        </div>
                        {errors.card_name && <p className="text-red-500 text-xs">{errors.card_name.message}</p>}
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <div className="input-field">
                                <label htmlFor="expiry_month">Expiry Month / Year</label>
                                <div className="input">
                                    <input
                                        type="month"
                                        placeholder="Enter your Expiry Month"
                                        id="expiry_month"
                                        minLength={new Date()}
                                        {...register('expiry_month', {
                                            required: 'Expiry Month is required',
                                            validate: (value) =>
                                                new Date(value) >= new Date()
                                                    ? true
                                                    : 'Expiry date must be in the future',
                                        })}
                                    />
                                </div>
                                {errors.expiry_month && <p className="text-red-500 text-xs">{errors.expiry_month.message}</p>}
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="input-field">
                                <label htmlFor="cvc">CVC</label>
                                <div className="input">
                                    <input
                                        type="text"
                                        placeholder="Enter your CVC"
                                        id="cvc"
                                        maxLength={3}
                                        {...register('cvc', { required: 'cvc is required', minLength: { value: 3, message: 'CVV must be at least 3 digits' }, maxLength: { value: 4, message: 'CVV cannot exceed 4 digits' } })}
                                    />
                                </div>
                            </div>
                        </div>
                        {errors.cvv && <p className="text-red-500 text-xs">{errors.cvv.message}</p>}
                    </div>
                    {Error && <p className="text-red-500 text-xs">{Error}</p>}
                    <button className={`${styles.submitBtn} mt-2 w-100`}>Submit</button>
                </form>
            </div>
        </div>
    );
};

export default Payment;
