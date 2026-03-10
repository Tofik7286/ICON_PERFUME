import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { MdOutlineArrowOutward } from "react-icons/md";
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination'; // Add pagination CSS

// Import required modules
import { Navigation, Autoplay, EffectFade, Pagination } from 'swiper/modules'; // Add Pagination module
import Image from 'next/image';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBanners } from '../redux/productSlice';
import { addToast } from '../redux/toastSlice';

const Herosection1 = ({ banners }) => {
    const [isDesktop, setIsDesktop] = useState(false);
    const url = process.env.NEXT_PUBLIC_API_URL
    const dispatch = useDispatch();

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <div className="container-fluid padd-x">
                <div className="herosection">
                    <div className="hero-content">
                        <Swiper
                            autoplay={{
                                delay: 5000,
                                disableOnInteraction: true,
                            }}
                            pagination={{
                                clickable: true,
                                type: 'bullets',
                                el: '.swiper-pagination',
                                bulletClass: 'swiper-pagination-bullet',
                                bulletActiveClass: 'swiper-pagination-bullet-active'
                            }}
                            slidesPerView={1}
                            effect={'fade'}
                            className="mySwiper w-100 h-100"
                            modules={[Pagination, Autoplay, EffectFade]} // Add Pagination to modules
                        >
                            {banners &&
                                banners.filter((_, i) => _.is_active === true).map((item, index) => (
                                    <SwiperSlide key={index} className="me-0 d-md-block d-none">
                                        <Image
                                            src={item.image && item.mobile_image ? process.env.NEXT_PUBLIC_BACKEND_URL + item.image : "/images/not_found.png"}
                                            alt="Hide Life Style"
                                            width={1440}
                                            height={600}
                                        />
                                    </SwiperSlide>
                                ))}
                            {banners &&
                                banners.filter((_, i) => _.is_active === true).map((item, index) => (
                                    <SwiperSlide key={index} className="me-0 d-md-none d-block">
                                        <Image
                                            src={item.image && item.mobile_image ? process.env.NEXT_PUBLIC_BACKEND_URL + item.mobile_image : "/images/not_found.png"}
                                            alt="Hide Life Style"
                                            width={1440}
                                            height={1800}
                                        />
                                    </SwiperSlide>
                                ))}
                            {/* Add pagination container */}
                            <div className="swiper-pagination"></div>
                        </Swiper>
                    </div>
                </div>
            </div>
           
        </>
    )
}

export default Herosection1