import Image from 'next/image'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import Cookies from 'universal-cookie'
import { loader } from '../redux/loaderSlice'
import { addToast } from '../redux/toastSlice'

const Newsletter = () => {
    const url = process.env.NEXT_PUBLIC_API_URL
    const dispatch = useDispatch()
    const {register , handleSubmit , formState:{errors}, reset } = useForm();
    
    const onSubmit = async (data) => {
        dispatch(loader(true))
        try{
            const response = await fetch(`${url}/subscribe-news-letter/`, {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            const json = await response.json()

            if (json.success){

                dispatch(addToast({message: json.message , type: 'success'}))
                reset()
            }else{

                dispatch(addToast({message: json.message , type: 'error'}))
                reset()
            }
        }catch(error){

            dispatch(addToast({message: error.message , type: 'error'}))
        }finally{
            dispatch(loader(false))
        }

    }
    return (
        <>
            <div className="container-fluid padd-x mb-4">
                <div className="newsletter">
                    <div className="row h-100">
                        <div className="col-lg-7 col-12">
                            <h2>Stay Updated, Stay <span>Stylish!</span></h2>
                            <p>Subscribe to our newsletter for exclusive offers, new arrivals, and expert tips on caring for your leather bags. Join our community and carry style wherever you go!</p>
                            <form onSubmit={handleSubmit(onSubmit)}  className='news-form'>
                                <input 
                                    type="email" 
                                    placeholder='Enter your email address...' 
                                    {...register('email', { required: 'Email is required'})} />
                                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                                <button type="submit" className='button border mt-3 news-btn'>
                                    <span className="text-wrapper" data-text="Subscribe Now"></span>
                                    <div className="fill"></div>
                                </button>
                            </form>
                        </div>
                        <div className="col-lg-5 col-12 d-flex align-items-center justify-content-center h-100">
                            {/*<div className="news-image">
                                <Image src="/images/newsletter.png" className={`img-fluid`} width={500} height={500} />
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Newsletter
