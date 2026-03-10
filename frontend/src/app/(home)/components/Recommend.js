import React, { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { BsArrowLeftShort } from "react-icons/bs";
import { BsArrowRightShort } from "react-icons/bs";
import { IoArrowForwardOutline } from "react-icons/io5";
import Link from 'next/link';
import Product from './Product';

const Recommend = ({data}) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (prevRef.current) {
            prevRef.current.disabled = isBeginning;
        }
        if (nextRef.current) {
            nextRef.current.disabled = isEnd;
        }
        if (prevRef.current) prevRef.current.disabled = progress === 0;

    }, [isBeginning, isEnd]);

    return (
        <>
            <div className="container-fluid padd-x mb-5 products mt-4">
                <div className="heading align-items-center">
                    <h2>Recommended Products</h2>
                    <div className='para'>
                        <Link href={"/shop/"} className='button border mt-3'>
                            <span className="text-wrapper" data-text="All Products"></span>
                            <div className="fill"></div>
                        </Link>
                    </div>
                </div>

                <Swiper
                    breakpoints={{
                        999: {
                            slidesPerView: 4,
                            spaceBetween: 20
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 20
                        },
                        499: {
                            slidesPerView: 2,
                            spaceBetween: 10
                        },
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
                        setProgress(swiper.progress)
                    }}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: true
                    }}
                    slidesPerView={2}
                    spaceBetween={10}
                    className="mySwiper mt-3"
                    modules={[Navigation, Autoplay]}
                    style={{ width: "100%", height: "100%" }}
                >
                    {data && data.filter((item) => item.available && item.stock !== 0).map((item, index) => {
                        return <SwiperSlide key={index}>
                            <Product data={item} />
                        </SwiperSlide>
                    })}
                </Swiper>

                <div className="d-flex align-items-center mt-3">
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
                    </div>
                    <button className={`arrow ${isBeginning ? 'disabled' : ''}`} ref={prevRef} disabled={isBeginning} style={isBeginning ? { opacity: 0.5 } : { opacity: 1 }}>
                        <BsArrowLeftShort />
                    </button>
                    <button className={`arrow ${isEnd ? 'disabled' : ''}`} ref={nextRef} disabled={isEnd} style={isEnd ? { opacity: 0.5 } : { opacity: 1 }}>
                        <BsArrowRightShort />
                    </button>
                </div>
            </div>
        </>
    )
}

export default Recommend
