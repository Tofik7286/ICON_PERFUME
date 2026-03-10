'use client'
import React from 'react';
import styles from '@/app/(home)/styles/Profile.module.css';
import Image from 'next/image';
import Link from 'next/link';

const Orders = ({data}) => {
    
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };

    return (
        <div className={styles.orders_container}>
            <h4 className={`${styles.heading} !font-[500] `}>My Orders</h4>

            {data && data.length > 0 ? data.map((order, index) => (
                order.items.length > 0 && <Link key={index} href={`/profile/orders/${order.id}`} className={styles.order_card}>
                    <div className={styles.order_image}>
                        {order.items[0]?.variant && <Image
                            src={order.items[0].variant.images[0] ? process.env.NEXT_PUBLIC_BACKEND_URL + order.items[0].variant.images[0].image : '/images/not_found.png'}
                            alt={order.items[0].variant.product.title}
                            width={100}
                            height={100}
                            style={{ borderRadius: '8px' }}
                        />}
                    </div>
                    <div className={styles.order_details}>
                        <h4 className={styles.product_name}><b>{order.order_number}</b></h4>
                        <p>
                            <b>Order Date:</b> {formatDate(order.order_date)}
                        </p>
                        <p>
                            <b>Price:</b> &#8377; {order.final_price}
                        </p>
                        <p
                            className={`${styles.status}`}
                            style={order.order_status === 'Pending' ? { background: "red" } : { background: "green" }}
                        >
                            {order.order_status}
                        </p>
                    </div>
                </Link>
            )) :
                <div className='d-flex align-items-center justify-center w-100 flex-col '>
                    <Image src={"/images/no_order.png"} className="mb-4" style={{ opacity: ".5" }} width={100} height={100} alt="No orders found" />
                    <h3 style={{ fontSize: "1.7em", fontWeight: "500" }}>No Orders Found</h3>
                    <Link href={"/shop/"} className={`${styles.button} !text-white  shine-button`}>Shop Now</Link>
                </div>
            }
        </div>
    );
};

export default Orders;
