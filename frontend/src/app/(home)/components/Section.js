import React, { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { BsArrowLeftShort } from "react-icons/bs";
import { BsArrowRightShort } from "react-icons/bs";
import styles from '@/app/(home)/styles/section.module.css'
import Link from 'next/link'
import Image from 'next/image'
import Product2 from './Product2';

const Section = ({ products, categories }) => {

    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);
    const [progress, setProgress] = useState(0);
    const [category, setCategory] = useState('');
    const [data, setData] = useState([]);
    

    useEffect(() => {
        if (prevRef.current) {
            prevRef.current.disabled = isBeginning;
        }
        if (nextRef.current) {
            nextRef.current.disabled = isEnd;
        }
        if (prevRef.current) prevRef.current.disabled = progress === 0;

    }, [isBeginning, isEnd]);
    

    useEffect(() => {
        if(categories){
            setCategory(categories[0] && categories[0].name)
            setData(products.filter((item) => item.product.category && item.product.category.length > 0 ? 
                item.product.category.map(cat => cat.name).includes(categories[0].name) : []))
        }
    }, [products])
    

    const handleCategory = (name) => {
        setCategory(name)
        setData(products.filter((item) => item.product.category.map(cat => cat.name).includes(name)))
    }

    return (
        <>
            <div className="container-fluid padd-x mt-3">
                <div className="heading align-items-start">
                    <h2><span>Elegance</span> in Every Leather Bag, Every Journey</h2>
                    <div className='para'>
                        <p><span>Leather bags</span> combine timeless elegance with unmatched durability, making them a perfect investment. Designed to age beautifully, they offer lasting style, functionality, and resilience—ideal for professionals and travelers who value <span>quality and sophistication</span> in every journey.</p>
                        <Link href={"/about/"} className='button border mt-3'>
                            <span className="text-wrapper" data-text="Learn more"></span>
                            <div className="fill"></div>
                        </Link>
                    </div>
                </div>
                <div className={styles.section}>
                    <div className="row">
                        <div className="col-lg-4 col-12">
                            <div className={styles.image}>
                                <Image src={"/images/Hide GIF.gif"} className='img-fluid' width={1000} height={1000} alt="Section reveal animation" />
                            </div>
                        </div>
                        <div className="col-lg-8 col-12">

                            <div className={styles.btns}>
                                {categories && categories.map((item, index) => {
                                    return <button key={index} onClick={() => {handleCategory(item.name)  }} className={`${styles.btn} ${category == item.name ? styles.active : ''}`}>{item.name}</button>
                                })}
                            </div>
                            <Swiper
                                breakpoints={{
                                    999: {
                                        slidesPerView: 3,
                                        spaceBetween: 20
                                    },
                                    768: {
                                        slidesPerView: 3,
                                        spaceBetween: 20
                                    },
                                    599: {
                                        slidesPerView: 3,
                                        spaceBetween: 20
                                    },
                                    449: {
                                        slidesPerView: 2,
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
                                slidesPerView={2}
                                spaceBetween={10}
                                className="mySwiper mt-3"
                                modules={[Navigation, Autoplay]}
                            >
                                {data.length > 0 ? (
                                    data.filter((item) => item.available && item.stock !== 0).map((item, index) => (
                                        <SwiperSlide key={item.id || index}>
                                            <Product2 data={item} />
                                        </SwiperSlide>
                                    ))
                                ) : null}
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
                    </div>
                </div>
            </div>
        </>
    )
}

export default Section
