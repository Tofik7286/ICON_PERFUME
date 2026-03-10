
"use client"
import React, { useState } from 'react';
import styles from '@/app/(home)/styles/aboutus.module.css'
import Link from "next/link";
import Image from 'next/image';
import PageHeader from '../components/PageHeader';
import Breadcrumb from '../components/BreadCrumb';
import { motion } from 'framer-motion'
import Faq from '../components/Faq';

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

const About = () => {

    return (
        <div className={`${styles.about_hero} main-container py-3`}>
            <div className={`${styles.about_hero_sec} main-section padd-x `}>
                <div>
                    <motion.p variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }} className='uppercase '>Made with Purity</motion.p>
                    <div className='heading !my-0'>
                        <motion.h1 variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} className=' !w-full lg:!w-[35%] mt-4'>Fragrances That Evoke Emotion</motion.h1>
                    </div>
                </div>
                <div className={`${styles.about_hero_sec_img} mt-4`}>
                    <div className='row gx-3 gy-3'>
                        <motion.div variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} className='col-lg-6 col-md-6 col-sm-12'>
                            <Image src="/icon_images/About us banner 1.png" alt="Shanaya Attar About Us" width={1000} height={1000} />
                        </motion.div>
                        <motion.div variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} className='col-lg-3 col-md-3 col-sm-6'>
                            <Image src="/icon_images/Isreal product ban Banner.ai 2.png" alt="Ammer Al Oudh Attar About Us" width={1000} height={1000} />
                        </motion.div>
                        <motion.div variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} className='col-lg-3 col-md-3 col-sm-6'>
                            <Image src="/icon_images/Banner 2 1.png" alt="ZXX Attar About us" width={1000} height={1000} />
                        </motion.div>
                    </div>
                </div>
                <div className={`${styles.aboutsec_2} mt-4`}>
                    <div className={`${styles.aboutsec_2_main} `}>
                        <div className="heading flex-column  align-items-center">
                            <div className='mt-5'>
                                <motion.p variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }} className='uppercase'>Why Choose Icon Perfumes</motion.p>
                            </div>
                            <div className=' text-center d-flex justify-content-center mt-4'>
                                <motion.h2 variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }} className='!w-full' >
                                    Where Tradition, Purity, and Passion is united
                                </motion.h2>
                            </div>
                        </div>
                        <div className="row align-items-center">
                            <div className="col-lg-4 col-md-6 col-12">
                                <div className="why-item">
                                    <motion.div variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }} className="why-image">
                                        <Image src="/images/natural.png" className='img-fluid' alt='flower' width={200} height={200} />
                                    </motion.div>
                                    <motion.h4 variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }}>Natural Ingredients</motion.h4>
                                    <motion.p variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }}>Our attars are made with 100% natural and ethically sourced materials, selected with the specialist botanical knowledge of an experienced team. There is total transparency and accountability in our sourcing practice, resulting in a level of purity, safety and authenticity in every bottle.</motion.p>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-12">
                                <div className="why-item">
                                    <motion.div variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }} className="why-image">
                                        <Image src="/images/long.png" className='img-fluid' alt='Crafted Formulations' width={200} height={200} />
                                    </motion.div>
                                    <motion.h4 variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }}>
                                        Crafted Formulations</motion.h4>
                                    <motion.p variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }}>Each attar is uniquely crafted by experienced perfumers that emphasise traditional Middle Eastern and Indian scent blends. Each alcohol-free formula salute old-world craftsmanship - Icon Perfumes will feel captivating, elegant, and soulful.</motion.p>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-12">
                                <div className="why-item">
                                    <motion.div variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }} className="why-image">
                                        <Image src="/images/skin.png" className='img-fluid' alt='Economic Luxury' width={200} height={200} />
                                    </motion.div>
                                    <motion.h4 variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }}>Economic Luxury</motion.h4>
                                    <motion.p variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }}>Icon Perfumes wants everybody to experience the elegance of a premium fragrance. Luxury should never be exclusive. We value our customers and their dollars which is why our alcohol-free hand-crafted attar prices are considered fair for the unrivaled quality you will receive.</motion.p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`${styles.aboutsec_3} mt-4`}>
                    <div className="row">
                        <motion.div variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} className="col-lg-5 col-md-6 col-12">
                            <Image src="/icon_images/empowerment_perfume.png" alt="Oudh Sums Attar About US" width={1000} height={1000} />
                        </motion.div>
                        <div className="col-lg-7 col-md-6 !p-[2em] col-12 flex flex-col justify-between gap-3">
                            <div className={`${styles.inner_box} d-flex justify-content-start flex-column  gap-3`}>
                                <motion.div variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }} className='heading !my-0'>
                                    <h2 className='!w-full'>Our Journey</h2>
                                </motion.div>
                                <motion.p variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }}>Icon Perfumes is more than a brand—it&apos;s a story of devotion to timeless scents. From our humble beginnings, Icon Perfumes has grown into a purveyor of fine attars, driven by a passion for fragrance and a commitment to quality. We strive to bring the rich heritage of attar to a global audience, with a touch of modern innovation. Icon Perfumes is based in Ahmedabad, India, a city with a rich history of trade and culture, which has deeply influenced our approach to fragrance creation.</motion.p>
                                <ul className='mt-3 !pl-4 list-disc  d-flex flex-column gap-3'>

                                    <motion.li variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }}>Alcohol-Free Mastery</motion.li>
                                    <motion.li variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }}>Artisan Craftsmanship</motion.li>
                                    <motion.li variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }}>Natural Ingredient Sourcing</motion.li>
                                </ul>
                            </div>
                            <div className='d-flex justify-content-start flex-column '>
                                <div className='row gx-3 gy-3'>
                                    <motion.p variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }} className='!font-bold' >Milestones & Product Growth</motion.p>
                                    <div className='col-lg-4 col-md-4 col-12'>
                                        <motion.h4 variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }}>2016</motion.h4>
                                        <motion.p variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }}>Launch of Smart Perfume with 5–6 Products</motion.p>
                                    </div>
                                    <div className='col-lg-4 col-md-4 col-12'>
                                        <motion.h4 variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }}>2019</motion.h4>
                                        <motion.p variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }}>Rebranded to Icon Perfumes, 20+ Products </motion.p>
                                    </div>
                                    <div className='col-lg-4 col-md-4 col-12'>
                                        <motion.h4 variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }}>2025</motion.h4>
                                        <motion.p variants={fadeUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }}>70+ Diverse Product Offerings </motion.p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`${styles.aboutsec_4} mt-5 `}>
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-12 flex flex-col justify-center">
                            <div className=' p-[2em] flex flex-col align-items-start gap-3'>
                                <motion.p variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }} className='uppercase'>Our Identity</motion.p>
                                <div className='heading !my-0 '>
                                    <motion.h2 variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }} className=' !w-full lg:!w-[66%]'>The Essence of Fragrance</motion.h2>
                                </div>

                                <motion.p variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }}>At Icon Perfumes, we consider fragrance as more than just a fragrance—it is a memory, a presence, and a feeling, and we aim to provide an unmatched fragrance experience. We truly believe the scent is powerfully communicative, and our attars are designed to help you find and express your identity. Our commitment to quality goes beyond the materials of the products, we think of every touchpoint on our brand to be committed to quality, from the way we produce our attars to the way we treat our guests with customer service. We aim to make luxury fragrances available to everyone, offering a collection of high-quality attars at incredible prices. Experience the magic of genuine, alcohol-free fragrance with Icon Perfumes. We are not just fragrance providers; we are fragrance curators, and we can&apos;t wait for you to explore our collection of passionate scents.&quot; </motion.p>
                                <motion.p variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }}>An icon of care and positivity, we set out to provide a tranquil environment. We ensure that every our guest feels valued, cared for, and that each experience leaves you feeling renewed, revitalized, and restored. Whether you spend a few moments at our location or a few hours in pampering, you will leave feeling you have experienced one of the calmest or best.</motion.p>
                            </div>
                        </div>
                        <motion.div variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} className="col-lg-6 col-md-6 col-12">
                            <Image src="/icon_images/wellness_perfume.png" alt="hero" width={1000} height={1000} />
                        </motion.div>
                    </div>
                </div>
                <div className={`${styles.aboutsec_5} mt-5`}>
                    <div className='row gx-3 gy-3'>
                        <div className='col-lg-5'>
                            <motion.div variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }} className='heading !my-0'>
                                <h2 className='!w-full'>Our Beliefs & Goal</h2>
                            </motion.div>
                        </div>
                        <div className='col-lg-7'>
                            <motion.p variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}>We at Icon Perfumes believe that fragrance is a meaningful, silent expression of identity and feeling. Our goal is to produce quality, long-lasting attars that represent trust, purity, and heritage. We intend to become a prominent name in the world of alcohol-free perfumes- revered not only for our proprietary formulations, but for the heartfelt experience we grand.</motion.p>
                        </div>
                    </div>
                    <div className='row mt-3 gx-3 gy-3'>
                        <motion.div variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} className='col-lg-6 col-md-6 col-sm-12'>
                            <Image  className='h-full object-cover' src="/icon_images/mission_perfume1.png" alt="hero" width={1000} height={1000} />
                        </motion.div>
                        <motion.div variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} className='col-lg-3 col-md-3 col-sm-6'>
                            <Image src="/icon_images/mission_perfume2.png" alt="hero" width={1000} height={1000} />
                        </motion.div>
                        <motion.div variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} className='col-lg-3 col-md-3 col-sm-6'>
                            <Image src="/icon_images/mission_perfume3.png" alt="hero" width={1000} height={1000} />
                        </motion.div>
                    </div>
                </div>
                <Faq/>
            </div>
        </div >
    );
};

export default About;

