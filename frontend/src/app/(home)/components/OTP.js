import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import styles from '@/app/(home)/styles/modal.module.css';
import { HiMail } from "react-icons/hi";
import { useSelector } from 'react-redux';
import { closeModal, resolveModal, selectModal } from '../redux/modalSlice';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loader } from '../redux/loaderSlice';
import { addToast } from '../redux/toastSlice';
import Cookies from 'universal-cookie';

const OTP = () => {

    const { modalProps, url } = useSelector(selectModal);
    const dispatch = useDispatch();
    const api_url = process.env.NEXT_PUBLIC_API_URL
    const router = useRouter();
    const cookies = new Cookies();
    const [Error, setError] = useState('');
    
    const { register, handleSubmit, setValue, getValues, clearErrors, reset, formState: { errors } } = useForm({
        defaultValues: {
            otp: ['', '', '', '', '', ''],
        },
    });

    useEffect(() => {
        // Focus the first input when the component mounts
        const firstInput = document.getElementById(`otp-input-0`);
        if (firstInput) {
            firstInput.focus();
        }
    }, []); // Run only on mount only on mount

    // Handle form submission
    const onSubmit = async (data) => {
        const otpValue = data.otp.join('');
        clearErrors('otp')
        try {
            setError('')
            dispatch(loader(true))
            const response = await fetch(url, {
                method: "POST",
                credentials:"include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    email: modalProps.email, 
                    otp: otpValue,
                    data: modalProps
                })
            })

            const json = await response.json();
            if (json.success) {
                dispatch(resolveModal(json)); 
                dispatch(closeModal())
            } else {
                setError(json.message);
            }

        } catch (error) {
            setError(error.message);
        } finally {
            dispatch(loader(false))
        }
        // Handle OTP verification here
    };

    const sendOtp = async () => {
        try {
            setError('')
            reset()
            const firstInput = document.getElementById(`otp-input-0`);
            if (firstInput) {
                firstInput.focus();
            }
            dispatch(loader(true))
            const response = await fetch(`${api_url}/send-otp/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: modalProps.email })
            })

            const json = await response.json();

            if (json.success) {
                const message = json.message;
                dispatch(addToast({ message, type: 'success' }));
                reset({ otp: '' })
            } else {
                setError(json.message);
            }
        } catch (error) {
            setError(error.message);

        } finally {
            dispatch(loader(false))
        }
    }
    // Handle input change (focus on the next input field)
    const handleChange = (e, index) => {
        const value = e.target.value;

        // Ensure only digits are allowed
        if (/\d/.test(value)) {
            setValue(`otp[${index}]`, value.slice(-1)); // Set only the last digit
            clearErrors('otp'); // Clear any OTP errors
            setError('')
            // Move to the next input if available
            if (index === 5 && value) {
                handleSubmit(onSubmit)();
            } else if (index < 5 && value) {
                // Move to the next input if available
                const nextInput = document.getElementById(`otp-input-${index + 1}`);
                if (nextInput) {
                    nextInput.focus();
                }
            }
        }
    };

    // Handle backspace navigation
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            const currentValue = getValues(`otp[${index}]`);

            // If current field is empty, move focus to the previous field
            if (!currentValue && index > 0) {
                const prevInput = document.getElementById(`otp-input-${index - 1}`);
                if (prevInput) {
                    prevInput.focus();
                }

                // Clear the value of the previous field
                setValue(`otp[${index - 1}]`, '');
            } else {
                // Clear the current field
                setValue(`otp[${index}]`, '');
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('Text');
        
        if (/^\d{6}$/.test(pastedData)) { // Ensure exactly 6 digits are pasted
            pastedData.split('').forEach((digit, index) => {
                setValue(`otp[${index}]`, digit); // Update each input field
                const inputElement = document.getElementById(`otp-input-${index}`);
                if (inputElement) {
                    inputElement.value = digit; // Reflect the value in the DOM
                }
            });
    
            // Automatically submit if all digits are pasted
            handleSubmit(onSubmit)();
        } else {
            console.error("Invalid OTP format. Please paste exactly 6 digits.");
        }
    };

    return (
        <div className={styles.content}>
            <div className={styles.content_icon}>
                <HiMail />
            </div>
            <h3>Check Your Email</h3>
            <p>Enter the verification code sent to</p>
            <span>{modalProps.masked_email ? modalProps.masked_email : ''}</span>

            <form onSubmit={handleSubmit(onSubmit)} onPaste={handlePaste} className={styles.otpForm}>
                <div className={styles.otpInputs}>
                    {Array(6)
                        .fill('')
                        .map((_, index) => (
                            <input
                                key={index}
                                name={`otp[${index}]`}
                                type="text"
                                maxLength="1" // Set programmatically
                                id={`otp-input-${index}`}
                                {...register(`otp[${index}]`, {
                                    required: 'All fields are required',
                                    validate: (value) => /\d/.test(value) || 'Only digits are allowed',
                                })}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className={styles.otpInput}
                                inputMode="numeric" // Ensure numeric keyboard on mobile
                                pattern="\d*" // Restrict input to digits
                            />
                        ))}
                </div>
                {errors.otp && <p className="text-red-500 text-sm">{errors.otp.message}</p>}
                <p>Didn&apos;t get your code? <button type='button' className='fw-bold' onClick={sendOtp}>Send Code</button></p>
                {Error && <p className="text-red-500 text-sm">{Error}</p>}
                <button type="submit" className={`${styles.submitBtn} w-100`}>
                    Verify Email
                </button>
            </form>
        </div>
    );
};

export default OTP;