import React, { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { RiDoubleQuotesL } from "react-icons/ri";
import { RiDoubleQuotesR } from "react-icons/ri";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { BsArrowLeftShort } from "react-icons/bs";
import styles from '@/app/(home)/styles/testimonial.module.css'
import { BsArrowRightShort } from "react-icons/bs";
import { IoArrowForwardOutline } from "react-icons/io5";
import Link from 'next/link';
import { GoPerson } from "react-icons/go";

const Testimonial = () => {

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
        <div className={`container-fluid padd-x ${styles.testimonial} mb-4`}>
            <div className="heading">
                <h2><span>See Why</span> our customers <span>love</span> us!</h2>
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
                        spaceBetween: 20
                    },
                    449: {
                        slidesPerView: 1,
                        spaceBetween: 10
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
                    setProgress(swiper.progress)
                }}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: true
                }}
                slidesPerView={1}
                spaceBetween={20}
                className="mySwiper mt-3"
                modules={[Navigation, Autoplay]}
            >
                <SwiperSlide>
                    <div className={styles.item}>
                        <div className={styles.user}>
                            <div className={styles.icon}>
                                <GoPerson />
                            </div>
                            <h5>John Doe</h5>
                        </div>
                        <div className={styles.content}>
                            <p>
                                <span>&quot;</span>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam aliquid dignissimos minima corrupti consequuntur dolore ipsam illum vitae ad amet!
                                <span>&quot;</span>
                            </p>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className={styles.item}>
                        <div className={styles.user}>
                            <div className={styles.icon}>
                                <GoPerson />
                            </div>
                            <h5>John Doe</h5>
                        </div>
                        <div className={styles.content}>
                            <p>
                                <span>&quot;</span>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam aliquid dignissimos minima corrupti consequuntur dolore ipsam illum vitae ad amet!
                                <span>&quot;</span>
                            </p>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className={styles.item}>
                        <div className={styles.user}>
                            <div className={styles.icon}>
                                <GoPerson />
                            </div>
                            <h5>John Doe</h5>
                        </div>
                        <div className={styles.content}>
                            <p>
                                <span>&quot;</span>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam aliquid dignissimos minima corrupti consequuntur dolore ipsam illum vitae ad amet!
                                <span>&quot;</span>
                            </p>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className={styles.item}>
                        <div className={styles.user}>
                            <div className={styles.icon}>
                                <GoPerson />
                            </div>
                            <h5>John Doe</h5>
                        </div>
                        <div className={styles.content}>
                            <p>
                                <span>&quot;</span>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam aliquid dignissimos minima corrupti consequuntur dolore ipsam illum vitae ad amet!
                                <span>&quot;</span>
                            </p>
                        </div>
                    </div>
                </SwiperSlide>
            </Swiper>
        </div>
    )
}

export default Testimonial
