
'use client'
import React, { useState } from 'react';
import styles from '@/app/(home)/styles/contactus.module.css';
import PageHeader from '../components/PageHeader';
import { useDispatch } from 'react-redux';
import { addToast } from '../redux/toastSlice';
import { useForm } from 'react-hook-form';
import { loader } from '../redux/loaderSlice';
import Link from 'next/link';
import Breadcrumb from '../components/BreadCrumb';
import Image from 'next/image';
import { IoLocationOutline } from "react-icons/io5";
import { IoCallOutline } from "react-icons/io5";
import { CiMail } from "react-icons/ci";
import { FiFacebook } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import { FiLinkedin } from "react-icons/fi";
import { SiInstagram } from "react-icons/si";
import Faq from '../components/Faq';

const Contact = () => {

  const url = process.env.NEXT_PUBLIC_API_URL
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const dispatch = useDispatch()

  const onSubmit = async (data) => {
    dispatch(loader(true))
    try {
      const response = await fetch(`${url}/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
        })
      })
      const json = await response.json();
      if (json.success) {
        dispatch(addToast({ message: json.message, type: 'success' }))
        reset()
      } else {
        dispatch(addToast({ message: json.message, type: 'error' }))
      }
    } catch (error) {

      dispatch(addToast({ message: 'Something went wrong. Please try again.', type: 'error' }))
    } finally { 
      dispatch(loader(false))
    }
  }

  return (
    <div>
      <div className={styles.container}>
        <div className='w-full'>
          <div className='row gx-3 gy-3'>
            <div className='col-lg-8 flex flex-col gap-3 justify-between'>
              {/* <Image src="/icon_images/contact_hero1.png" width={1000} height={1000} className='img-fluid'/> */}
              <div className='heading!my-0 '>
                <h1 className='!w-full'>Connect with Icon Perfumes – The Essence of Attars </h1>
              </div>
            </div>
            {/* <div className='col-lg-4'>
              <Image src="/icon_images/contact_hero2.png" width={1000} height={1000} className='img-fluid' />
            </div> */}
          </div>
        </div>
        <div className="row mt-3 mb-6 ">
          <div className="col-sm-5 mb-5">
            <div className={styles.contact_info_container}>
              <div className={styles.contact_item} >
                <div className='flex gap-3 items-center'>
                  <span><IoLocationOutline size={30}/></span> <h5>Address</h5>
                </div>
                <p className='mt-4'>Chandan Talawdi , Dariyapur , Ahmedabad 380001</p>
              </div>
              <div className={styles.contact_item} >
                <div className='flex gap-3 items-center'>
                  <span><IoCallOutline size={30} /></span> <h5>Call</h5>
                </div>
                <Link target='blank' href="tel:+919998377554">
                  <p className='mt-4 opacity-70'>+91 9998377554</p>
                </Link>
                <Link target='blank' href="tel:+919825677554">
                  <p className='mt-1 opacity-70'>+91 9825677554</p>       
                </Link>
              </div>
              <div className={` !border-b-0 ${styles.contact_item}`} >
                <div className='flex gap-3 items-center'>
                  <span><CiMail size={30} /></span> <h5>Email</h5>
                </div>
                <Link target='blank' href="mailto:info@iconperfumes.in">
                  <p className='mt-4 opacity-70'>info@iconperfumes.in</p>
                </Link>
              </div>
            
            </div>
            <div className='mt-3 flex gap-2 items-center'>
              <h5>Follow Us:</h5> <span className='flex gap-2 items-center'>
                <FiFacebook size={20}/>
                <FaXTwitter size={20} />
                <FiLinkedin size={20} />
                <Link target='blank' href="https://www.instagram.com/icon_perfume_/">
                   <SiInstagram size={20} />
                </Link>
              </span>
            </div>
          </div>

          {/* Right Side Form */}
          <form className="col-sm-7 p-lg-5 p-3" onSubmit={handleSubmit(onSubmit)}>
              <div className='flex flex-col gap-3'>
                  <p className='uppercase'>Contact <span className='bg-[var(--accent-color)] p-1 rounded'>Form</span></p>
                  <div className='heading '>
                    <h2 className='!w-full !mb-0'>Get in Touch </h2>
                  </div>
              </div>
            <div className="row mb-2">
              {/* First Name */}
              <div className="col-12">
                <div className={styles.input_field}>
                  <div className={styles.input}>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder='Your Name'
                      // placeholder="Enter your First Name"
                      id="name"
                      {...register('name', { required: true })}
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                  </div>
                </div>
              </div>

              {/* Last Name */}
              <div className="col-12">
                <div className={styles.input_field}>
                  <div className={styles.input}>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder='Your Email'
                      // placeholder="Enter your First Name"
                      id="email"
                      {...register('email', { required: true })}
                    />
                  </div>
                </div>
                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              </div>
              <div className="col-12">
                <div className={styles.input_field}>
                  <div className={styles.input}>
                    <input
                      className={styles.input}
                      type="text"
                      maxLength={10}
                      placeholder="Your Phone"
                      id="phone"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[6-9]\d{9}$/, // For Indian phone numbers starting with 6-9 and 10 digits long
                          message: "Invalid phone number",
                        },
                      })}
                    />

                  </div>
                </div>
                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="row mb-2">
              {/* Email */}
              <div className="col-12">
                <div className={styles.input_field}>
                  <div className={styles.input}>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder='Subject'
                      // placeholder="Enter your First Name"
                      id="subject"
                      {...register('subject', { required: true })}
                    />
                    {errors.subject && <p className="text-red-500 text-xs">{errors.subject.message}</p>}

                  </div>
                </div>
              </div>
            </div>

           

            <div className="row mb-2">
              {/* How we can help you? */}
              <div className="col-12">
                <div className={styles.input_field}>
                  <div className={styles.input}>
                    <textarea
                      className={styles.input}
                      id="help"

                      placeholder="Message"
                      rows="5"
                      {...register('message', { required: true })}
                    // className={styles.textarea}
                    />
                    {errors.message && <p className="text-red-500 text-xs">{errors.message.message}</p>}

                  </div>
                </div>
              </div>
            </div>

            <div className={styles.button_container}>
              <button type="submit" className={styles.button}>
                Submit
              </button>
            </div>
          </form>
        </div>
       
      </div>
      <div className='bg-[var(--accent-color)]  container-fluid padd-x'>
        <div className='py-[2em]'>
          <div className='row gx-3 gy-3'>
            <div className='col-md-4 flex gap-3'>
                <Image className=' w-[4em] h-[3em]' src="/icon_images/truck2png.png" width={50} height={30} alt="Fast response"/>
                <div className='flex flex-col gap-1'>
                <h4>Fast Response</h4>
                <p> We’re here to assist you quickly and efficiently.</p>
                </div>
            </div>
            <div className='col-md-4 flex gap-3'>
              <Image className=' w-[4em] h-[3em]' src="/icon_images/glove2.png" width={50} height={30} alt="Secure communication" />
              <div className='flex flex-col gap-1'>
                <h4>Secure Communication</h4>
                <p>Your shared information stays private and protected.</p>
              </div>
            </div>
            <div className='col-md-4 flex gap-3'>
              <Image className=' w-[4em] h-[3em]' src="/icon_images/headphones.png" width={50} height={30} alt="Fragrance guidance" />
              <div className='flex flex-col gap-1'>
                <h4>Fragrance Guidance</h4>
                <p> We help you find the perfect fragrance match. </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Contact;
