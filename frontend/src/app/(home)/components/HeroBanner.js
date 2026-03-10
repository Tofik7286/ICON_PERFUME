'use client'
import React from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import { motion } from 'framer-motion'
import Link from 'next/link'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 1) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: 0.3 * i,
            duration: 0.6,
            ease: 'easeOut',
        },
    }),
}

const zoomIn = {
    hidden: { scale: 1.1 },
    visible: {
        scale: 1,
        transition: {
            duration: 1.5
        }
    }
}
const data = [
    {
        image:"/icon_images/saffron-oil-glass-bottle-with-gold-rim-cork-stopper_1301196-798.avif",
        title:"Discover Finest Alcohol-Free Attars",
        content:"Discover exquisite, long-lasting attars and roll-on perfumes crafted with care. Experience captivating fragrances without the use of alcohol."
    },
    {
        image: "/icon_images/Hero banners 3 1.png",

    },
    {
        image: "/icon_images/image 1.png",
       
    },
    {
        image: "/icon_images/image 2.png",
       
    }
    
]
const HeroBanner = ({banners}) => {
    
    return (
        <div className="w-full h-auto  relative">
            <Swiper
                modules={[Autoplay, EffectFade, Pagination]}
                effect="fade"
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                loop
                pagination={{ clickable: true }}
                className="w-full h-full"
            >
                {banners && banners.length > 0 ? banners.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div className=" w-full h-full">
                            {/* Only apply zoomIn on the first slide */}
                           
                                <motion.div
                                    variants={zoomIn}
                                    initial="hidden"
                                    animate="visible"
                                  className="w-full h-full hidden md:block"
                                >
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${slide.image}`}
                                        alt="Icon Perfume Khamrah Pefume"
                                    width={1000}
                                    height={1000}
                                        fetchPriority='high'
                                        priority
                                    className="!w-full"
                                    />
                                </motion.div>
                            <motion.div
                                variants={zoomIn}
                                initial="hidden"
                                animate="visible"
                                className="w-full h-full block md:hidden"
                            >
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${slide.mobile_image || slide.image}`}
                                    alt={`Icon Perfume Khamrah Pefume Mobile`}
                                    width={1000}
                                    height={1000}
                                    fetchPriority="high"
                                    priority
                                    className="!w-full"
                                />
                            </motion.div>
                           
                            <div className="absolute inset-50 bg-black/50 z-10" />
                            <div className="absolute z-20 inset-0 flex flex-col justify-center items-start px-6 md:px-20 text-white">
                                <motion.h1
                                    custom={1}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="visible"
                                    className="text-3xl md:text-5xl font-bold leading-tight mb-4 max-w-[600px]"
                                >
                                    {slide.title}
                                </motion.h1>
                                <motion.p
                                    custom={2}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="visible"
                                    className="text-base md:text-lg max-w-[500px] mb-6"
                                >
                                    {slide.content}
                                </motion.p>
                                {
                                    index===0 &&
                                    <motion.div
                                        variants={fadeUp}
                                        initial="hidden"
                                        animate="visible"
                                        className='flex mt-4 gap-3 items-center'
                                    >
                                        <Link className="button border" href="/shop/">
                                            <span className="text-wrapper" data-text="Shop now"></span>
                                            <div className="fill"></div>
                                        </Link>
                                    </motion.div>
                                }
                               
                            </div>
                        </div>
                    </SwiperSlide>
                )) : null}
            </Swiper>
        </div>
    )
}

export default HeroBanner
