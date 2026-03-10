'use client'
import { useEffect, useRef } from "react";
import Link from "next/link";
import { IoArrowForwardOutline } from "react-icons/io5";
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { BsArrowLeftShort } from "react-icons/bs";
import { BsArrowRightShort } from "react-icons/bs";
import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";

const Category = ({categories}) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);
    const [progress, setProgress] = useState(0);

    // const { categories, variant, status, error } = useSelector((state) => state.products);

    const category2 = [
        {
            "image": "/images/product6.png",
            "title": "Skin Care"
        },
        {
            "image": "/images/product6.png",
            "title": "Hair Care"
        },
        {
            "image": "/images/product6.png",
            "title": "Makeup & Beauty"
        },
        {
            "image": "/images/product6.png",
            "title": "Lenses"
        },
        {
            "image": "/images/product6.png",
            "title": "Muse Lenses"
        }
    ]

    if (category2 && category2.length > 0) {
        return (
            <div className="container-fluid category padd-x">
                <div className="heading ">
                    <h2>Discover Our <span>Diverse Categories</span> of Bags</h2>
                </div>
                <Swiper
                    breakpoints={{
                        999: {
                            slidesPerView: 3,
                            spaceBetween: 20
                        },
                        768: {
                            slidesPerView: 2,
                            spaceBetween: 20
                        },
                        599: {
                            slidesPerView: 2,
                            spaceBetween: 20
                        }
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
                    slidesPerView={1}
                    spaceBetween={20}
                    className="mySwiper mt-3"
                    modules={[Navigation, Autoplay]}
                >
                    {categories && categories.length > 0 && categories.map((item, index) => {
                        return <SwiperSlide key={index}>
                            <Link href={`/shop?category=${item.name}`} className="category-item">
                                <div className="ctc"><IoArrowForwardOutline /></div>
                                <Image src={item.category_image ? process.env.NEXT_PUBLIC_BACKEND_URL + item.category_image : "/images/product1.webp"} className='img-fluid' alt={item.name || "Product category"} width={1000} height={500} />
                                <h4>{item.name}</h4>
                            </Link>
                        </SwiperSlide>
                    })}
                </Swiper>
                <div className="d-flex align-items-center mt-3">
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
                    </div>
                    <button
                        className={`arrow ${isBeginning ? 'disabled' : ''}`}
                        ref={prevRef}
                        disabled={isBeginning}
                        style={{ opacity: isBeginning ? 0.5 : 1 }}
                    >
                        <BsArrowLeftShort />
                    </button>
                    <button
                        className={`arrow ${isEnd ? 'disabled' : ''}`}
                        ref={nextRef}
                        disabled={isEnd}
                        style={{ opacity: isEnd ? 0.5 : 1 }}
                    >
                        <BsArrowRightShort />
                    </button>
                </div>
            </div>
        );
    } else {
        return;
    }

};

export default Category;

