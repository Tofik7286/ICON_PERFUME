'use client'
import React, { useEffect } from 'react'
import { LuPlus } from "react-icons/lu";
import { LuMinus } from "react-icons/lu";
import { FaTruckFast } from "react-icons/fa6";
import { BsBoxSeam } from "react-icons/bs";
import CartStyles from '@/app/(home)/styles/cart.module.css'
import styles from '@/app/(home)/styles/cart_page.module.css'
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { cartDrawer, decreaseQty, fetchCart, increaseQty, selectCart } from '../redux/cartSlice';
import { setCheckoutItems } from '../redux/checkoutSlice';
import PageHeader from './PageHeader';
import { loader } from '../redux/loaderSlice';
import Cookies from 'universal-cookie';

const Cart = () => {

    const router = useRouter()

    const cookies = new Cookies()
    const dispatch = useDispatch();
    const { status, error, openCart, cart, total } = useSelector(selectCart);

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    const handleCheckout = () => {
        const consent = cookies.get("cookie_consent");
        if (consent === "rejected") {
            dispatch(openPopup())
            return
        }
        router.push('/checkout')
        dispatch(setCheckoutItems())
        close(false);
        dispatch(cartDrawer(false));
    }

    return (
        <>
            <PageHeader heading={"Cart"} img={'/images/page-banner1.jpg'} tag={"h1"} />
            <div className={`${styles.cart} padd-x`}>
                <div className={`${styles.section1} w-100 mb-3`}>
                    <div className={styles.cartbox}>
                        <table>
                            <thead>
                                <tr className={`${styles.item}`}>
                                    <th className='pl-2'>Product</th>
                                    <th className={`${styles.quantity}`}>Quantity</th>
                                    <th>Total Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart && cart.length > 0 ?
                                    cart.map((item, index) => {
                                        return <tr key={index} className={`${styles.item}`}>
                                            <td className={`d-flex gap-2 ${styles.item_product}`}>
                                                <Link href={`/shop/${item.variant.product.slug}/${item.variant.encoded_sku}/${encodeURIComponent(item.variant.product.description.slice(0, 50))}`} className={styles.image}>
                                                    <Image src={item.variant.images?.[0]?.image ? process.env.NEXT_PUBLIC_BACKEND_URL + item.variant.images[0].image : "/images/not_found.png"} width={500} height={500} alt={item.variant?.product?.title || 'Cart item'} className='img-fluid' />
                                                </Link>
                                                <div className={`${styles.description}`}>
                                                    <div className={`${styles.detail}`}>
                                                        <h5>{item.variant.product.title}</h5>
                                                    </div>
                                                    <div className={`${styles.detail_description_box}`}>
                                                        <div className={`${styles.detail_description}`}>
                                                            <h6><b className='me-1'>Color: </b>{item.variant.color.name}</h6>
                                                            <h6><b className='me-1'>Price: </b>${item.variant.discounted_price}</h6>
                                                        </div>
                                                        <div className={`${styles.quantity1} quantity accent`}>
                                                            <div className="svg"><LuMinus /></div>
                                                            <input type="number" minLength={0} value={0} />
                                                            <div className="svg"><LuPlus /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`${styles.quantity}`}>
                                                <div className="quantity accent">
                                                    <button className={`svg ${item.quantity === 1 ? "disabled" : ''}`} onClick={() => { dispatch(decreaseQty(item.variant.id)) }} disabled={item.quantity === 1} ><LuMinus /></button>
                                                    <input type="number" minLength={0} value={item.quantity} />
                                                    <button className="svg" onClick={() => { dispatch(increaseQty({ id: item.variant.id, quantity: 1 })) }}><LuPlus /></button>
                                                </div>
                                            </td>
                                            <td className={`${styles.total}`}>
                                                <h5>GBP {item.variant.discounted_price * item.quantity}</h5>
                                            </td>
                                        </tr>
                                    }) : null}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="d-flex align-items-end justify-content-end w-100">
                    <div className={`${styles.section2}`}>
                        <h5 className='mb-2'>Cart Total</h5>
                        <table border="1">
                            <tbody>
                                <tr>
                                    <th>Total</th>
                                    <th className='text-right'>GBP {total}</th>
                                </tr>
                            </tbody>
                        </table>
                        <button onClick={handleCheckout} className={`${styles.pay} ${CartStyles.btn}`}>
                            Checkout
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Cart