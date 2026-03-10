'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Cookies from 'universal-cookie'
import Product from '../components/Product'
import { useDispatch } from 'react-redux'
import { fetchWishList, removeWishList, selectWishList } from '../redux/wishListSlice'
import { useSelector } from 'react-redux'
import { IoCloseOutline } from "react-icons/io5";
import styles from '@/app/(home)/styles/wislist.module.css'
import { HiOutlineShoppingBag } from "react-icons/hi2";
import Link from 'next/link'
import { addToCart } from '../redux/cartSlice'
import PageHeader from '../components/PageHeader'
import Image from 'next/image'

const Wishlist = () => {

    const cookies = new Cookies()
    const url = process.env.NEXT_PUBLIC_API_URL
    const token = cookies.get('is_logged_in');
    const { status, error, wishList } = useSelector(selectWishList);

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchWishList())
    }, [dispatch])
    
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
    return (
        <>
            <div className="container-fluid text-[] padd-x">
                <div className='py-[2em]'>
                    <div className='heading'>
                        <h1 className='!w-full fs-3'>My Wishlist <span className='!font-200 opacity-50'>({wishList && wishList.length} items)</span></h1>
                    </div>
                    <div className="row mt-3 g-lg-4 g-md-3 g-2">
                        {wishList && wishList.length > 0 ? (
                            wishList.map((item, index) => (
                                <div key={index} className="col-lg-3 col-md-4 col-sm-6 col-6 ">
                                    <div className={` h-full ${styles.item}`}>
                                        <Link href={getProductURL(item?.variant?.product)} className={styles.image}>
                                            <Image src={item?.variant?.images[0]?.image ? process.env.NEXT_PUBLIC_BACKEND_URL + item.variant.images[0]?.image : '/images/not_found.png'} className='img-fluid' width={500} height={500} alt={item?.variant?.product?.title || 'Wishlist item'} />
                                        </Link>
                                        <Link href={getProductURL(item?.variant?.product)} className={styles.details}>
                                            <h4 className="name">{item.variant.product.title}</h4>
                                            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                                                <p className="price">&#8377; {item.variant.discounted_price}</p>
                                                <p className="price">&#8377; {item.variant.price}</p>
                                            </div>
                                        </Link>
                                        {
                                            item.variant.available && item.variant.stock != 0?
                                                item.variant.stock < 11 && <p className=" !text-red-500 mb-2">Only {item.variant.stock} left</p>  :
                                                <p className='text-red-500 mb-2' style={{ fontSize: "1em" }}>items is not available</p>
                                        }
                                        <button onClick={() => { dispatch(removeWishList(item.variant.id)) }} className={styles.remove}>
                                            <IoCloseOutline />
                                        </button>
                                        <button   onClick={() => { dispatch(addToCart({ quantity: 1, variant_data: item.variant })) }} className={`${styles.addtoCart} shine-button`}><HiOutlineShoppingBag /> Add to Cart</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.not_found}>
                                <p className='text-center'>No products were added to the wishlist page. <Link href={"/shop"}>Back to shopping</Link> </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Wishlist
