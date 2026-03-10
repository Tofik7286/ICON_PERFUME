

'use client'
import React, { useEffect } from 'react';
import styles from '@/app/(home)/styles/Profile.module.css';
import { IoBagCheck } from "react-icons/io5";
import { FaTruck } from "react-icons/fa6";
import { FaBox } from "react-icons/fa6";
import axios from 'axios';
import Cookies from 'universal-cookie';
import { useState } from 'react';
import { BsBoxSeamFill } from "react-icons/bs";
import Link from 'next/link';
import Image from 'next/image';

const OrderId = ({data}) => {
    const [downloading, setDownloading] = useState(false);
    
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };

    const statuses = ["confirmed", "shipped", "out_for_delivery", "delivered"];
    const progress = statuses.reduce((acc, status, index) => {
        const currentStatusIndex = statuses.indexOf(
            data?.order.order_status
                .toLowerCase() // Normalize to lowercase
                .replace(/\s+/g, '_') // Replace spaces with underscores
        );
        acc[status] = index <= currentStatusIndex;
        return acc;
    }, {});

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

    if (data) {

        return (
            <div className={styles.order_detail_container}>
                <div className={styles.order_card_detail}>
                    <div className={styles.order_header}>
                        <h4 style={{ fontWeight: "500" }}>Order ID: {data?.order.order_number}</h4>
                    </div>

                    {data && data.order_items.length > 0 ? data.order_items.map((item, index) => {
                        return <Link href={getProductURL(item?.variant?.product)} key={index} className={styles.order_body}>
                            <Image
                                src={item?.variant?.images[0]?.image ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${item?.variant?.images[0]?.image}`:""}
                                alt={item.variant?.product.title}
                                width={500}
                                height={500}    
                                style={{ width: "7em", height: "7em", borderRadius: ".5em" }}
                            />
                            <div>
                                <h4>{item.variant?.product.title}</h4>
                                <p><b>Price :</b> &#8377; {item.variant?.discounted_price}</p>
                                {item.variant.color && <p><b>Color :</b> {item.variant?.color.name}</p>}
                                <p><b>Quantity :</b> {item.quantity}</p>
                            </div>
                        </Link>
                    }) : null}

                    {!data.order_items[0].variant.product.is_giftcard && <div className={styles.order_progress}>
                        <div className={progress.confirmed ? styles.progress_step_active : styles.progress_step}>
                            <span ><IoBagCheck style={{ height: 20, width: 20 }} /></span>
                            <p>Placed</p>
                        </div>

                        <div className={`${styles.progress_line} ${progress.shipped ? styles.progress_line_active : ""}`}></div>
                        <div className={progress.shipped ? styles.progress_step_active : styles.progress_step}>
                            <span ><BsBoxSeamFill style={{ height: 20, width: 20 }} /></span>
                            <p>Shipped</p>
                        </div>

                        <div className={`${styles.progress_line} ${progress.out_for_delivery ? styles.progress_line_active : ""}`}></div>

                        <div className={progress.out_for_delivery ? styles.progress_step_active : styles.progress_step}>
                            <span ><FaTruck style={{ height: 20, width: 20 }} /></span>
                            <p>Out For <br /> Delivery</p>
                        </div>
                        <div
                            className={`${styles.progress_line} ${progress.delivered ? styles.progress_line_active : ""}`}
                        ></div>

                        <div className={progress.delivered ? styles.progress_step_active : styles.progress_step}>
                            <span><FaBox style={{ height: 20, width: 20 }} /></span>
                            <p>Delivered</p>
                        </div>
                    </div>}
                    <div className="row w-100">

                        <div className="col-md-5 col-12">
                            <div className={`${styles.order_detail_body}`} >
                                <div className="w-100">
                                    <h4 style={{ marginTop: 30, paddingBottom: 10, borderBottomColor: '#999', borderBottomWidth: 2, borderStyle: 'dashed', }}><b>Shipping Details</b></h4>
                                    <p style={{ marginTop: 20, paddingBottom: 5 }}><b>Order Date: </b>{formatDate(data.order?.order_date)}</p>
                                    <p style={{ paddingBottom: 5 }}><b>Ship To: </b>{data.order?.address}, {data.order?.city}, {data.order?.country}, {data.order?.pincode}</p>
                                    <p style={{ paddingBottom: 5 }}><b>Contact:</b> {data.order?.phone_number}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-7 col-12 pe-0">
                            <div className={styles.price_detail_body} >
                                <div className="w-100">
                                    <h4 style={{ marginTop: 30, paddingBottom: 10, borderBottomColor: '#999', borderBottomWidth: 2, borderStyle: 'dashed', }}>  <b>Price Details</b></h4>
                                    <p style={{ paddingBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}><b>Actual Price :</b> &#8377; { data.order?.discount ? data.order.final_price === "0.00" ? data.order.discount : parseFloat(parseFloat(data.order.gst) + parseFloat(data.order.sub_total) + parseFloat(data.order.discount)).toFixed(2) : data.order.sub_total}</p>
                                    {data.order?.discount && data.order.discount !== "0.00" && <p style={{ paddingBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><b>Discount :</b> &#8377; {data.order?.discount || "0"}</p>}
                                    <p style={{ paddingBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><b>Sub Total : </b>&#8377; {data.order?.sub_total || "0"}</p>
                                    <p style={{ paddingBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><b>shipping Charges :</b> &#8377; {data.order?.shipping_charges || "-"}</p>
                                    {/* <p style={{ paddingBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><b>Tax : </b>&#8377; {data.order?.gst || "0"}</p> */}
                                    <p style={{ paddingBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 30 }}><b>Total Amount : </b><b>&#8377; {data.order?.final_price}</b> </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*<div className={styles.order_actions}>
                        <button className={styles.track_button}>Cancel</button>
                        <button className={styles.prepay_button}>Return</button>
                    </div>*/}

                    {data.order?.payment_status === 'Paid' && data.order?.order_status !== 'Cancelled' && (
                        <div style={{ padding: '15px 0', textAlign: 'center' }}>
                            <button
                                disabled={downloading}
                                onClick={async () => {
                                    try {
                                        setDownloading(true);
                                        const res = await fetch(
                                            `${process.env.NEXT_PUBLIC_API_URL}/download-invoice/${data.order.order_number}/`,
                                            { credentials: 'include' }
                                        );
                                        if (!res.ok) throw new Error('Download failed');
                                        const blob = await res.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `invoice_${data.order.order_number}.pdf`;
                                        document.body.appendChild(a);
                                        a.click();
                                        a.remove();
                                        window.URL.revokeObjectURL(url);
                                    } catch (err) {
                                        console.error(err);
                                    } finally {
                                        setDownloading(false);
                                    }
                                }}
                                style={{
                                    display: 'inline-block',
                                    padding: '10px 25px',
                                    backgroundColor: '#111',
                                    color: '#fff',
                                    borderRadius: '5px',
                                    border: 'none',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: downloading ? 'wait' : 'pointer',
                                    opacity: downloading ? 0.7 : 1,
                                }}
                            >
                                {downloading ? 'Generating...' : '📄 Download Invoice'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    } else {
        return (
            <div className="d-flex align-items-center justify-content-center flex-col" style={{ height: "100vh" }}>
                {error ? null : <div className="loader-circle">
                    <span className="loader"></span>
                </div>}
                {error && <h6 className="mt-2">!{error}</h6>}
            </div>
        )
    }

};

export default OrderId;
