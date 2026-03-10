'use client'
import React, { useState } from 'react'
import styles from '@/app/(home)/styles/login.module.css'
import { useForm } from 'react-hook-form'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Image from 'next/image'
import { useDispatch } from 'react-redux'
import { loader } from '@/app/(home)/redux/loaderSlice'
import { addToast } from '@/app/(home)/redux/toastSlice'
import { useRouter, useSearchParams } from 'next/navigation'

const ResetPassword = ({token}) => {

  const {register ,handleSubmit ,reset ,formState:{errors}} = useForm();
  const dispatch = useDispatch()
  const [passwordVisible, setPasswordVisible] = useState([false, false]);
    const params = useSearchParams();
    const redirect = params.get("redirect") ? params.get("redirect") : "/"

  const togglePasswordVisibility = (index) => {

    const array = [...passwordVisible];
    array[index] = !passwordVisible[index]
    setPasswordVisible(array);
  };
  
  const url = process.env.NEXT_PUBLIC_API_URL
  const router = useRouter();

  const resetPassword = async (data)=>{
    if(data.password !== data.new_password){
        dispatch(addToast({message:"Confirm Password not match new password" , type:'error'}))
        return 
    }
    try{
        dispatch(loader(true))
        const response  = await fetch(`${url}/reset-password/${token}/`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        const json = await response.json();
        if(json.success){
            dispatch(addToast({message: json.message, type: 'success'}))
            router.push('/login/')
        }else{
            dispatch(addToast({message: json.message, type: 'error'}))
        }
    }catch(error){
        dispatch(addToast({message: JSON.message , type:'error'}))
    }finally{
        dispatch(loader(false))
    }
  }

  

  return (
    <div className={`${styles.login} padd-x`}>
    <div className="row h-100 align-items-center">
        <div className="col-lg-6 col-12">
            <div className={styles.login_container}>
                <form onSubmit={handleSubmit(resetPassword)}>
                    <div className="input-field">
                        <label htmlFor="email">Enter New Password</label>
                        <div className="input">
                            <input
                                type={passwordVisible[0] ? "text" : "password"}
                                placeholder="Enter Password"
                                id="contact"
                                {...register('password', {
                                    required: 'Email or Phone Number is required',
                                })}
                            />
                            {passwordVisible[0] ? <FaRegEye  onClick={() => {togglePasswordVisibility(0)}} /> :  <FaRegEyeSlash onClick={() => {togglePasswordVisibility(0)}} />}
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs">{errors.password.message}</p>
                        )}
                    </div>
                    <div className="input-field">
                        <label htmlFor="email">Confirm Password</label>
                        <div className="input">
                            <input
                                type={passwordVisible[1] ? "text" : "password"}
                                placeholder="Enter confirm password"
                                id="contact"
                                {...register('new_password', {
                                    required: 'Password is required',
                                            minLength: {
                                                value: 6,
                                                message: 'Password must be at least 6 characters',
                                            }
                                })}
                            />
                            {passwordVisible[1] ? <FaRegEye  onClick={() => {togglePasswordVisibility(1)}} /> :  <FaRegEyeSlash onClick={() => {togglePasswordVisibility(1)}} />}
                        </div>
                        {errors.new_password && (
                            <p className="text-red-500 text-xs">{errors.new_password.message}</p>
                        )}
                    </div>
                    <button type='submit' className={styles.button}>Submit</button>
                </form>
            </div>
        </div>
        <div className="col-lg-6 col-12">
            <div className={styles.image}>
                      <Image src="/images/Log In banner.png" className='img-fluid' alt="Reset password banner - Icon Perfumes" width={1000} height={1000} />
            </div>
        </div>
    </div>
</div>
  )
}

export default ResetPassword
