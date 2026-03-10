'use client'
import React, { useEffect, useRef, useState } from 'react'
import styles from '@/app/(home)/styles/detail.module.css'
import Breadcrumb from '@/app/(home)/components/BreadCrumb'
import { FaAngleUp } from "react-icons/fa6";
import { FaAngleDown } from "react-icons/fa6";
import { Swiper, SwiperSlide } from 'swiper/react';
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { SlStar } from "react-icons/sl";
import { FaStar } from "react-icons/fa6";
import { LuPlus } from "react-icons/lu";
import { LuMinus } from "react-icons/lu";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

import { Navigation, Pagination } from 'swiper/modules';
import Recommend from '@/app/(home)/components/Recommend';
import axios from 'axios';
import ReviewPage from '@/app/(home)/components/Review';
import Review from '@/app/(home)/components/Review';
import { set } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { loader } from '../redux/loaderSlice';
import { addWishList, fetchWishList, removeWishList, selectWishList } from '../redux/wishListSlice';
import { useSelector } from 'react-redux';
import { addToCart, fetchCart, selectCart, setQty } from '../redux/cartSlice';
import { notFound, usePathname, useRouter } from 'next/navigation';
import Cookies from 'universal-cookie';
import { addCheckoutItem } from '@/app/(home)/redux/checkoutSlice';
import { addToast } from '@/app/(home)/redux/toastSlice';
import PageHeader from '@/app/(home)/components/PageHeader';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import NotesCard from './NotesCard';

export function MarkdownRenderer({ description }) {
    const DOMAIN = process.env.NEXT_PUBLIC_BACKEND_URL; // Replace with your actual domain

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
                img: ({ node, ...props }) => {
                    // Check if src is a relative path
                    const src = props.src?.startsWith('/')
                        ? DOMAIN + props.src
                        : props.src;

                    return (
                        <Image
                            {...props}
                            src={src}
                            alt={props.alt || ''}
                            width={1000}
                            height={1000}
                            loading="lazy"
                            className='img-fluid mt-3'
                        />
                    );
                },
            }}
        >
            {description}
        </ReactMarkdown>
    );
}

const Detail = ({ review, detailData,slug, product }) => {

    const [selectedColor, setSelectedColor] = useState(null);
    const [data, setData] = useState(null);
    const [allVariants, setAllVariants] = useState([]);
    const [related, setRelated] = useState([]);

    const images = [
        "/images/bag-bg.jpg",
        "/images/bag-bg.jpg",
        "/images/bag-bg.jpg",
        "/images/bag-bg.jpg",
        "/images/bag-bg.jpg",
        "/images/bag-bg.jpg",
        "/images/bag-bg.jpg",
        "/images/bag-bg.jpg",
    ];
    const [mainImage, setMainImage] = useState({ url: null, index: 0 });
    const [variant, setVariant] = useState(detailData?.variants[0]);
    const [colors, setColors] = useState([]);
    const [myError, setError] = useState("");
    // const [reviews, setReviews] = useState([])
    const [windowWidth, setWindowWidth] = useState();
    const [is_whislist, setIswhishlist] = useState(detailData?.variants[0]?.is_wishlist);

    const url = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        setWindowWidth(window.innerWidth)
    }, [])

    useEffect(() => {
        // getProduct();
        try {
            const json = detailData;
            if (json.success) {
                const variantId = json.variants.find(item => item.product.slug === slug)
                if (!variantId) {
                    setError("Product Not Found")
                }
                
                setVariant(variantId)
                setAllVariants(json.variants)
                setData(variant.product)
                setRelated(json.related_products)
                setMainImage({ url: variant.images[0] && variant.images[0].image, index: 0 })
            } else {

                setError("Product Not Found")
            }
        } catch (error) {

            setError("Product Not Found")
        }
    }, [])

    const { wishList } = useSelector(selectWishList);
    const { cart } = useSelector(selectCart);
    const [quantity, setQuantity] = useState(1);

    const cookie = new Cookies()
    const token = cookie.get('token')

    const nextRef = useRef(null);
    const prevRef = useRef(null);
    const swiperRef = useRef(null);
    const dispatch = useDispatch()
    const router = useRouter();
    const availability = variant ? variant.available && variant.stock !== 0 : true;

    const handleChangeImage = (item, index) => {
        setMainImage({ url: item, index: index })
    }

    useEffect(() => {
        dispatch(fetchCart())
    }, [dispatch])

    useEffect(() => {
        if (swiperRef.current) {
            swiperRef.current.params.navigation.prevEl = prevRef.current;
            swiperRef.current.params.navigation.nextEl = nextRef.current;

            swiperRef.current.navigation.init();
            swiperRef.current.navigation.update();
        }
    }, [swiperRef]);

    const pathname = usePathname();
  

    const handleAddWishlist = () => {
        if (is_whislist) {
            dispatch(removeWishList(variant.id))
            setIswhishlist(false)
        } else {
            dispatch(addWishList(variant))
            setIswhishlist(true)
        }
    }

    const handleAddToCart = async () => {
        if (data) {
            await dispatch(addToCart({ quantity: quantity, variant_data: variant }))
        }
    }

    const handleBuyNow = async () => {
        try {
            dispatch(loader(true))
            // Create server-side checkout session
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buy-now/`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variant_id: variant.id, quantity: quantity }),
            })
            const json = await res.json()
            if (json.success) {
                dispatch(addCheckoutItem({ item: variant, quantity: quantity, session_token: json.session_token }))
                router.push(`/checkout?source=buynow&session_token=${json.session_token}`)
            } else {
                dispatch(addToast({ message: json.message || 'Failed to start checkout', type: 'error' }))
            }
        } catch (error) {
            dispatch(addToast({ message: 'Something went wrong. Please try again.', type: 'error' }))
        } finally {
            dispatch(loader(false))
        }
    }
    
    
    const [subSwiperDirection, setSubSwiperDirection] = useState("horizontal");
    const [index, setIndex] = useState(0)

    

    const mainSwiperRef = useRef(null);
    const subSwiperRef = useRef(null);

    useEffect(() => {
        // Update windowWidth state on resize and adjust Swiper direction
        const handleResize = () => {
            const newWidth = window.innerWidth;
            setWindowWidth(newWidth);
            setSubSwiperDirection(newWidth >= 992 ? "vertical" : "horizontal");
        };
        window.addEventListener("resize", handleResize);
        // Trigger initial direction calculation
        handleResize();
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [windowWidth]);

    const breakpointsConfig = {
        1000: {
            slidesPerView: 3,
            spaceBetween: 10
        },
        768: {
            slidesPerView: 4,
            spaceBetween: 10,
        },
        599: {
            slidesPerView: variant && variant.images.length > 5 ? 5 : variant && variant.images.length,
        },
        499: {
            slidesPerView: variant && variant.images.length > 4 ? 4 : variant && variant.images.length,
        },
    };

    const handleMainImageChange = (ind) => {
        // Slide main swiper to the selected index
        if (mainSwiperRef.current) {
            mainSwiperRef.current.slideTo(ind);
            setIndex(ind)
        }
        // Slide sub swiper to make the active sub-image visible
        // if (subSwiperRef.current) {
        //     subSwiperRef.current.slideTo(index);
        // }
        handleChangeImage(variant.images[index]?.image, index);
    };
    useEffect(() => {
        if (swiperRef.current) {
            swiperRef.current.slideTo(index);
            handleMainImageChange(index)
        }
    }, [index, swiperRef])
    const handlePrevClick = () => {
        if (swiperRef.current) {
            if (index > 0) {
                setIndex(index - 1)
            }
        }
    };
    const handleNextClick = () => {
        if (swiperRef.current) {

            if (index < variant.images.length - 1) {
                setIndex(index + 1)
            }

        }
    }
    

        return (
            <>
                {myError && (
                    <div className="d-flex align-items-center justify-content-center flex-column" style={{ height: "50vh" }}>
                        <p className="text-red-500 text-lg font-semibold">{myError}</p>
                    </div>
                )}
                <div className={`container-fluid padd-x mt-3 ${styles.detail}`}>
                 
                    <div className="row position-relative">
                        <div className="col-lg-5 col-12">
                            <div className={styles.image_content}>
                                <div className="row">
                                    {/* Sub Image Swiper */}
                                    <div className="col-lg-2  col-12 d-flex align-items-center flex-lg-column order-lg-0 order-1">
                                        <div className={styles.sub_image_list}>
                                            <div className={styles.inner_sub_list}>
                                                <Swiper
                                                    direction={subSwiperDirection}
                                                    spaceBetween={10}
                                                    slidesPerView={3}
                                                    // Always 3 slides in vertical mode
                                                    style={subSwiperDirection === 'vertical' ? { height: "20em" } : undefined}
                                                    modules={[Navigation]}

                                                    onBeforeInit={(swiper) => {

                                                        swiperRef.current = swiper; // Store Swiper instance
                                                    }}
                                                    allowSlideNext={true}
                                                    breakpoints={breakpointsConfig}
                                                    allowTouchMove={variant.images.length > 3} // Enable scrolling if more than 3 slides
                                                >
                                                    {variant.images.map((item, index) => (

                                                        <>

                                                            <SwiperSlide key={index} >
                                                                <div
                                                                    onClick={() => handleMainImageChange(index)}
                                                                    className={`${styles.sub_image} ${mainImage.index === index ? styles.active : ""
                                                                        }`}
                                                                >
                                                                    <Image
                                                                        src={item.image ? process.env.NEXT_PUBLIC_BACKEND_URL + item.image : "/images/not_found.png"}
                                                                        className="img-fluid"
                                                                        alt={product?.title ? product.title + " thumbnail" : "Product thumbnail"}
                                                                        width={100}
                                                                        height={100}
                                                                    />
                                                                </div>
                                                            </SwiperSlide>
                                                        </>

                                                    ))}
                                                </Swiper>
                                            </div>

                                            {variant.images.length > 3 && (
                                                <div>
                                                    <button onClick={handlePrevClick}

                                                        className={`${styles.btn} ${styles.left}`}
                                                    >
                                                        <FaAngleUp />
                                                    </button>
                                                    <button

                                                        className={`${styles.btn} ${styles.right}`}
                                                        onClick={handleNextClick}
                                                    >
                                                        <FaAngleDown />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Main Image Swiper */}
                                    <div className="col-lg-10 col-12 order-lg-1 order-0">
                                        <Swiper
                                            slidesPerView={1}
                                            spaceBetween={10}
                                            onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
                                            onSlideChange={(swiper) =>
                                                handleMainImageChange(swiper.activeIndex)
                                            }
                                            modules={[Navigation]}
                                            navigation={{
                                                prevEl: prevRef.current,
                                                nextEl: nextRef.current,
                                            }}
                                            className={styles.mainSwiper}
                                        >
                                            {variant.images.map((item, index) => (
                                                <SwiperSlide key={index} className={styles.swiper_slide}>
                                                    <div className={styles.main_image}>
                                                        <button
                                                            onClick={handleAddWishlist}
                                                            className={`${styles.wishlist} ${is_whislist ? styles.active : ""
                                                                }`}
                                                        >
                                                            {is_whislist ? <IoHeart /> : <IoHeartOutline />}
                                                        </button>
                                                        <Image
                                                            src={item.image ? process.env.NEXT_PUBLIC_BACKEND_URL + item.image : "/images/not_found.png"}
                                                            className="img-fluid"
                                                            alt={product?.title || "Product image"}
                                                            width={1000}
                                                            height={1000}
                                                        />
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-7 col-12">
                            <div className={styles.content}>
                                <Breadcrumb/>
                                <div className='heading !my-0'>
                                     <h1 className='!w-full'>{data?.title}</h1>
                                </div>
                                {/*<div className={styles.rating}>
                                    <FaStar />
                                    <span>(4,9) 9,2k Reviews</span>
                                </div>*/}
                                <h4>Price</h4>
                                <div className={styles.price}>
                                    <p>&#8377; {variant.discounted_price}</p>
                                    <span>&#8377;{variant.price ? `  ${variant.price}` : null}</span>
                                </div>
                                
                                <div className="">
                                   

                                    <div className={`quantity accent ${styles.quantity}`}>
                                        <button
                                            disabled={quantity === 1}
                                            onClick={() => setQuantity(quantity - 1)}
                                            className={`svg ${quantity === 1 ? "disabled" : ""}`}
                                        >
                                            <LuMinus />
                                        </button>

                                        <input
                                            type="number"
                                            min={1}
                                            max={variant.stock}
                                            value={quantity}
                                            onChange={(e) => {
                                            const val = Number(e.target.value);
                                            if (val >= 1 && val <= variant.stock) {
                                                setQuantity(val);
                                            }
                                            }}
                                        />

                                        <button
                                            disabled={quantity === variant.stock}
                                            onClick={() => quantity < variant.stock && setQuantity(quantity + 1)}
                                            className="svg"
                                        >
                                            <LuPlus />
                                        </button>
                                        </div>

                                </div>

                                {/* <div className={`quantity accent ${styles.quantity}`}>
                                    <button disabled={quantity === 1} onClick={() => { setQuantity(quantity - 1) }} className={`svg ${quantity === 1 ? "disabled" : ''}`}><LuMinus /></button>
                                    <input type="number" minLength={0} value={quantity} />
                                    <button onClick={() => { setQuantity(quantity + 1) }} className="svg"><LuPlus /></button>
                                    </div> */}

                               
                                {!availability ? (
                                    <p className="text-red-500 text-sm">Product is not available</p>
                                ) : (
                                    variant.stock < 11 && (
                                        <p className="text-red-500 text-sm">Only {variant.stock} left</p>
                                    )
                                )}

                                <div className={styles.cta}>
                                    <button className={`${styles.button} shine-button ${!availability ? styles.disabled : ''}`} disabled={!availability} onClick={handleBuyNow}>Buy Now</button>
                                    <button className={`${styles.button} ${styles.add} ${!availability ? styles.disabled : ''}`} disabled={!availability} onClick={handleAddToCart}>Add to Cart</button>
                                </div>

                                <div className={styles.productDetails}>
                                    <div className={styles.desc}>
                                       
                                                <h4>Description</h4>
                                               
                                        <MarkdownRenderer description={data?.description } option/>
                                    </div>
                                    <div className="mt-2 mb-2">
                                        <NotesCard notes={variant.notes} />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <Review slug={slug} reviews={review?.data}  variant={variant} />
                {related.length > 0 ? <Recommend data={related} /> : null}
            </>
        )

}

export default Detail
