'use client'
import React, { useEffect } from 'react'
import styles from '@/app/(home)/styles/footer.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TiSocialFacebook } from "react-icons/ti";
import { AiOutlineInstagram } from "react-icons/ai";
import { RiTwitterXFill } from "react-icons/ri";
import { GrLinkedinOption } from "react-icons/gr";
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../redux/productSlice'
import { GoMail } from "react-icons/go";
import { SlEarphonesAlt } from "react-icons/sl";
import { FaArrowRight } from 'react-icons/fa'
import {motion} from 'framer-motion'
import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { useForm } from 'react-hook-form'
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

const Footer = ({products}) => {

    
    const pathname = usePathname();
    const dispatch = useDispatch();
    const url = process.env.NEXT_PUBLIC_API_URL

    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const onSubmit = async (data) => {
        dispatch(loader(true))
        try {
            const response = await fetch(`${url}/subscribe-news-letter/`, {
                method: 'POST',
                credentials: "include",
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

    function getProductURL(product) {
        const mainCategory = product.category.find(cat => cat.level === 0);
        const subCategory = product.category.find(cat => cat.level === 1);

        if (subCategory) {
            // We're on subcategory page → include both
            return `/${mainCategory.name.toLowerCase().replace(/\s+/g, '-')}/${subCategory.name.toLowerCase().replace(/\s+/g, '-')}/${product.slug}`;
        }

        // Otherwise just category/product-slug
        return `/${mainCategory.name.toLowerCase().replace(/\s+/g, '-')}/${product.slug}`;
    }

    useEffect(() => {
        dispatch(fetchCategories())
    }, [dispatch])

    if(pathname === "/checkout/" || pathname === "/payment-process/"){
        return;
    }
    
    return (
        <>
            <footer className={`${styles.footer} overflow-hidden  padd-x w-full`}>
                <div className={`${styles.footer_content}  py-[1em]  lg:py-[3em]`}>
                    <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
                            <div className="row  g-5">
                                <div className="col-lg-4 col-12 mb-2 flex flex-col  gap-5">
                                {/* <motion.h4 variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }} >Join for Special Offers & News!</motion.h4> */}
                                {/* <motion.div variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }}  class="relative w-[70%]">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder=''
                                        {...register('email', { required: 'Email is required' })} 
                                        class="peer border-b w-full border-gray-300 py-1 focus:border-b-2 focus:border-black-700 transition-colors focus:outline-none bg-inherit"
                                        />
                                    <button type='submit' className='absolute right-0 top-1'>
                                            <FaArrowRight className=' -rotate-45'/>
                                    </button>
                                        <label
                                            for="email"
                                        class="absolute left-0 top-2 text- text-base transition-all duration-200
                                            peer-placeholder-shown:top-2 peer-placeholder-shown:text-base
                                            peer-placeholder-shown:text-black-700
                                            peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black-700
                                            peer-[&:not(:placeholder-shown)]:-top-4 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-black-700"
                                        >Email</label
                                        >
                                    </motion.div> */}
                                    <div >
                                    <h4 className='mb-3'>Follow Us:</h4>
                                    <div className='flex gap-4 items-center text-xl'>
                                        <Link aria-label='Instagram-Icon Perfumes' target='blank' href="https://www.instagram.com/icon_perfume_/">
                                        <FaInstagram />
                                    </Link>
                                    {/* <FaFacebook /> */}
                                </div>
                                </div>
                                </div>
                               
                                <div className="col-lg-4 col-md-4 col-6">
                                    <div className={styles.links}>
                                    <motion.h5 variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }} >Top Products</motion.h5>
                                        <div className="row">
                                            <div className="col-12">
                                                <ul className='!mb-0'>
                                                {products?.length>0 && products.map((item, index) => {
                                                        return <motion.li variants={fadeUp}
                                                            initial="hidden"
                                                            whileInView="visible"
                                                            viewport={{ once: true, amount: 0.3 }} className='font-[600]' key={index}><Link href={getProductURL(item?.product)} className={pathname === `/shop/?category=${item?.product?.title}` ? styles.active : ''}>{item?.product?.title}</Link></motion.li>
                                                    })}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-2 col-md-4 col-6">
                                    <div className={styles.links}>
                                    <motion.h5 variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }} >UseFul Links </motion.h5>
                                        <ul className='font-[600] !mb-0'>
                                        <motion.li variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }} ><Link href={"/contact/"} className={pathname === "/contact/" ? styles.active : ''}>Contact Us</Link></motion.li>
                                        <motion.li variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }} ><Link href={"/faqs/"} className={pathname === "/faqs/" ? styles.active : ''}>FAQs</Link></motion.li>
                                        <motion.li variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }} ><Link href={"/privacy-policy/"} className={pathname === "/privacy-policy/" ? styles.active : ''}>Privacy Policy</Link></motion.li>
                                        <motion.li variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }} ><Link href={"/refund-policy/"} className={pathname === "/refund-policy/" ? styles.active : ''}>Return & Exchange Policy</Link></motion.li>
                                        <motion.li variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }} ><Link href={"/shipping-policy/"} className={pathname === "/shipping-policy/" ? styles.active : ''}>Shipping Policy</Link></motion.li>
                                        <motion.li variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }} ><Link href={"/payment-methods/"} className={pathname === "/payment-methods/" ? styles.active : ''}>Payment Instructions</Link></motion.li>
                                            <li><Link href={"/terms-and-conditions/"} className={pathname === "/terms-and-conditions/" ? styles.active : ''}>Terms and Conditions  </Link></li>

                                        </ul>
                                    </div>
                                </div>
                                <div className="col-lg-2 col-md-4 col-12">
                                    <div className={styles.links}>
                                        <h5>Quick Links</h5>
                                        <ul className='font-[600] !mb-0'>
                                        <motion.li variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }}><Link href={"/"} className={pathname === "" ? styles.active : ''}>Home</Link></motion.li>
                                        <motion.li variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }}><Link href={"/about/"} className={pathname === "/about/" ? styles.active : ''}>About us</Link></motion.li>
                                        <motion.li variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }}><Link href={"/blogs/"} className={pathname === "/blogs/" ? styles.active : ''}>Blogs</Link></motion.li>       
                                        </ul>
                                    </div>
                                </div>
                            </div>
                     </form>
                 
                    <div className='flex gap-2 flex-wrap mt-3 opacity-50 justify-between'>
                        <motion.p variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} >Copyright © 2025 Icon Perfumes. All Rights Reserved.</motion.p>
                        <motion.p variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} >Designed by <a target='_blank' href="https://www.webify.ai">Webify</a> . Powered by Icon Perfumes</motion.p>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer
