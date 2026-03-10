'use client'
import React, { useEffect, useState } from 'react'
import styles from '@/app/(home)/styles/product.module.css'
import { IoBagHandleOutline, IoHeart } from "react-icons/io5";
import Link from 'next/link';
import { IoHeartOutline } from "react-icons/io5";
import { GoArrowUpRight } from "react-icons/go";
import Image from 'next/image';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import Cookies from 'universal-cookie';
import { usePathname } from 'next/navigation';
import { addWishList } from '../redux/wishListSlice';

const Product = ({ data, height }) => {
    const [is_wishlist, setIs_whishlist] = useState(data?.is_wishlist)

    const dispatch = useDispatch();
            
    const availability = data ? data.available && data.stock !== 0 : true;

    const handleAddToCart = () => {
        dispatch(addToCart({ quantity: 1, variant_data: data }))
    }

    const handleWishList = () => {
        dispatch(addWishList(data))
        setIs_whishlist(true)
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
    
    // Now pass currentCategorySlug or currentSubCategorySlug to the URL builder
    const productLink = getProductURL(data.product);
    return (
        <div className={styles.item}>
            <div style={height&&{height:height}} className={styles.image}>
                <Link className='relative' href={productLink||"/shop"}>
                    <Image src={data && data && data.images[0] ? process.env.NEXT_PUBLIC_BACKEND_URL + data.images[0].image : '/images/not_found.png'} className={` ${styles.image1}`} alt={data?.product?.title + "- icon perfumes"} width={500} height={500} />
                    {
                        data.images[1] ? 
                            <Image src={data && data && data.images[1] ? process.env.NEXT_PUBLIC_BACKEND_URL + data.images[1].image : '/images/not_found.png'} className={` ${styles.image2}`} width={500} height={500} alt={data?.product?.title + "- icon perfumes"} />
                        :
                            <Image src={data && data && data.images[0] ? process.env.NEXT_PUBLIC_BACKEND_URL + data.images[0].image : '/images/not_found.png'} className={` ${styles.image2}`}  width={500} height={500} alt={data?.product?.title + "- icon perfumes"} />
                    }
                   
                </Link> 
                <div className={styles.ctc}>
                    <button aria-label={is_wishlist ? "Remove from wishlist" : "Add to wishlist"}  className={styles.add} style={{ "--delay": ".1s" }} onClick={handleWishList}>    {is_wishlist ? <IoHeart /> : <IoHeartOutline />}</button>
                    {/* <button disabled={!availability} className={styles.add} style={{ "--delay": ".3s" }} onClick={handleAddToCart}><span>Add To Cart</span> <IoBagHandleOutline /></button> */}
                </div>
            </div>
            <div className="d-flex align-items-center justify-content-between">
                <div className={styles.details}>
                   
                    <Link href={productLink || "/shop"}>
                        <h4 className='line-clamp-1 !text-start !text-sm  md:!text-lg'>{data.product.title}</h4>
                    </Link>
                    <div className='flex justify-between items-center'>
                     <p className={styles.price}>&#8377; {data && data.discounted_price}</p>
                        {
                            !availability ? <p className=' !text-sm text-red-700'>item not available</p>:
                        <button disabled={!availability} onClick={handleAddToCart} className='border  border-black hover:opacity-55 rounded-full px-2 py-1 sm:p-2' href="/about/">ADD TO CART</button>
                        }
                    </div>
                </div>
                                       
            </div>
        
                        
        </div>
    )
}

export default Product

