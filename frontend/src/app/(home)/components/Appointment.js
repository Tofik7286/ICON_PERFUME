'use client'
import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { loader } from '../redux/loaderSlice'
import { addToast } from '../redux/toastSlice'

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: 'easeOut'
        }
    }
}

const Appointment = ()=> {
    const url = process.env.NEXT_PUBLIC_API_URL
    const dispatch = useDispatch()
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const onSubmit = async (data) => {
        dispatch(loader(true))
        try {
            const response = await fetch(`${url}/subscribe-news-letter/`, {
                method: 'POST',
                credentials:"include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            const json = await response.json()
            if (json.success) {
                dispatch(addToast({ message: json.message, type: 'success' }))
                reset()
            } else {
                dispatch(addToast({ message: json.message, type: 'error' }))
                reset()
            }
        } catch (error) {

            dispatch(addToast({ message: error.message, type: 'error' }))
        } finally {
            dispatch(loader(false))
        }

    }
  return (
    <>
        <div className='container-fluid  appointment !my-[2em] padd-x '>
            <div className='py-[5em]'>
                <div className='flex w-full lg:w-[60%] flex-col gap-5'>
                    <div className='heading !my-0'>
                        <motion.h2 variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} className='!w-full !text-white'>Subscribe for new launches, exclusive offers, and fragrance tips. </motion.h2>
                    </div>
                    <motion.p variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }} className='!text-white'>Be the first to know about new product launches, special discounts, and exciting news from Icon Perfumes. Enter your name and email below to join our fragrance community and stay in the loop. </motion.p>
                </div>
                  <form onSubmit={handleSubmit(onSubmit)} className='mt-5 p-[2em] bg-white'>
                    <div className='row gx-3 gy-3'>
                        <div className='col-md-5'>
                            <div className="flex w-full items-center justify-center">
                                <motion.div variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }} className="relative w-full">
                                      <input
                                          id="name"
                                          name="name"
                                          type="text"
                                          placeholder=" "
                                          className="peer border-b w-full border-gray-300 py-1 focus:border-b-2 focus:border-black-700 transition-colors focus:outline-none bg-inherit"
                                          {...register('name', { required: 'Name is required' })}
                                      />
                                      <label
                                          htmlFor="name"
                                          className="absolute left-0 top-2 text- text-base transition-all duration-200
                                            peer-placeholder-shown:top-2 peer-placeholder-shown:text-base
                                            peer-placeholder-shown:text-black-700
                                            peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black-700
                                            peer-[&:not(:placeholder-shown)]:-top-4 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-black-700"
                                      >
                                          Name
                                      </label>
                                </motion.div>
                            </div>
                        </div>
                        <div className='col-md-5'>
                            <div className="flex w-full items-center justify-center">
                                <motion.div variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }} className="relative w-full">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder=''
                                          className="peer border-b w-full border-gray-300 py-1 focus:border-b-2 focus:border-black-700 transition-colors focus:outline-none bg-inherit"
                                        {...register('email', { required: 'Email is required' })} 
                                    />
                                      {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                                    <label
                                        htmlFor="email"
                                          className="absolute left-0 top-2 text- text-base transition-all duration-200
                                            peer-placeholder-shown:top-2 peer-placeholder-shown:text-base
                                            peer-placeholder-shown:text-black-700
                                            peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black-700
                                            peer-[&:not(:placeholder-shown)]:-top-4 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-black-700"
                                    >Email</label
                                    >
                                </motion.div>
                            </div>

                        </div>
                        <motion.div variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} className='col-md-2'>
                              <button aria-label='Join Newsletter' className="button !bg-white border" ><span className="text-wrapper !bg-white" data-text="Join Newsletter"></span><div className="fill "></div></button>
                        </motion.div>
                    </div>
                </form>
            </div>
        </div>
          <div className='container-fluid padd-x bg-[var(--accent-color)]'>
              <div className='flex py-[2em] justify-between gap-2 items-center'>
                  <div className='heading !my-0'>
                      <motion.h2 variants={fadeUp}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, amount: 0.3 }} className='!w-full !text-[#333833]'>Get In Touch with Us</motion.h2>
                  </div>
                  <motion.div variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.3 }}>
                      <Link aria-label='Contact us' className="button border" href="/contact/"><span className="text-wrapper" data-text="Contact Us"></span><div className="fill"></div></Link>
                  </motion.div>
              </div>
          </div>
    </>
  )
}

export default Appointment
