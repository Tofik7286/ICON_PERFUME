import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// Import required modules
import { Navigation, Autoplay } from 'swiper/modules';
import { BsArrowLeftShort } from "react-icons/bs";
import { BsArrowRightShort } from "react-icons/bs";
import Link from 'next/link';
import Product from './Product';
import { FaArrowRight } from 'react-icons/fa';
import { motion, useInView } from 'framer-motion'

const ProductList = ({ products }) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const headingRef = useRef(null);
    const buttonRef = useRef(null);
    const sliderRef = useRef(null)

    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);
    const [progress, setProgress] = useState(0);

    const headingInview = useInView(headingRef,{once:true,margin:"-50px 0px"})
    const buttonInview = useInView(buttonRef,{once:true,margin:"-50px 0px"})
    const sliderInview = useInView(sliderRef,{once:true,margin:"-100px 0px"}) 
    const sliderButtonInview = useInView(prevRef,{once:true,margin:"-50px 0px"})
    
    const fadeUp = {
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    }

    // Update navigation button states when slide changes
    useEffect(() => {
        if (prevRef.current) prevRef.current.disabled = isBeginning;
        if (nextRef.current) nextRef.current.disabled = isEnd;
    }, [isBeginning, isEnd]);
    

    return (
        <div className="container-fluid padd-x my-5 products">
            <div className="heading !my-3   align-items-center ">
                <motion.h2 ref={headingRef} initial="hidden" variants={fadeUp} animate={headingInview?"visible":"hidden"} transition={{
                    duration:0.4,delay:0.1
                }} >
                  Top Selling Scents
                </motion.h2>
                <motion.div ref={buttonRef} initial="hidden" variants={fadeUp} animate={buttonInview ? "visible" : "hidden"} transition={{
                    duration: 0.4, delay: 0.1
                }} className="para mt-3 lg:mt-0  !mb-0 ">
                    <Link className='flex gap-2 items-center' href="/shop?new_arrival=true">Browse All Products <span><FaArrowRight/></span></Link>
                </motion.div>
            </div>
            <motion.div ref={sliderRef}>
                <Swiper
                    breakpoints={{
                        999: { slidesPerView: 4, spaceBetween: 20 },
                        768: { slidesPerView: 3, spaceBetween: 20 },
                        499: { slidesPerView: 2, spaceBetween: 10 },
                    }}
                    
                    navigation={{
                        prevEl: prevRef.current,
                        nextEl: nextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                        swiper.params.navigation.prevEl = prevRef.current;
                        swiper.params.navigation.nextEl = nextRef.current;
                    }}
                    onSlideChange={(swiper) => {
                        setIsBeginning(swiper.isBeginning);
                        setIsEnd(swiper.isEnd);
                        setProgress(swiper.progress);
                    }}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: true,
                    }}
                    slidesPerView={2}
                    spaceBetween={10}
                    className="mySwiper "
                    modules={[Navigation, Autoplay]}
                >   
            
                    {products.length > 0 ? (
                        products.slice(0,4).map((item, index) => (
                            <SwiperSlide key={item.id || index}>
                                <motion.div  initial="hidden" variants={fadeUp} transition={{duration:0.6,delay:index*0.2}} animate={sliderInview?"visible":"hidden"}>
                                     <Product data={item}  />
                                </motion.div>
                            </SwiperSlide>
                        ))
                    ) : null}
                </Swiper>
            </motion.div>

            <div className="d-flex align-items-center mt-3">
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
                </div>
                <button
                    className={`arrow ${isBeginning ? 'disabled' : ''}`}
                    ref={prevRef}
                    disabled={isBeginning}
                    style={{ opacity: isBeginning ? 0.5 : 1 }}
                    aria-label='arrow left'
                >
                    <BsArrowLeftShort />
                </button>
                <button
                    className={`arrow ${isEnd ? 'disabled' : ''}`}
                    ref={nextRef}
                    disabled={isEnd}
                    style={{ opacity: isEnd ? 0.5 : 1 }}
                    aria-label='arrow right'
                >
                    <BsArrowRightShort />
                </button>
            </div>
        </div>
    );
};

export default ProductList;
