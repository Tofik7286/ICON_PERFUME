'use client'
import React from 'react'
import PageHeader from '../components/PageHeader'
import styles from '../styles/content_pages.module.css'
import Breadcrumb from '../components/BreadCrumb'
import Link from 'next/link'

function ShippingPolicy() {
    return (
        <>
            <PageHeader back_color="var(--accent-color)" heading="Shipping Policy for Icon Perfumes" tag={"h1"} />
            <div className={`${styles.content} padd-x mb-3`}>
                <div className='flex flex-col gap-2  mt-5 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>1. Shipping Time</span></h2>
                    </div>
                    <p>We strive to ship all orders within 48 working hours from the time the order is placed. However, please note that this is an estimate, and actual shipping times may vary based on order volume and other factors.</p>
                </div>
                {/* <div className='lg:flex justify-between w-[100%] mt-4 gap-2 '>
            <div className='lg:w-[80%] flex flex-col gap-2'>
                <h2>Shipping Destinations </h2>
                <p>We offer shipping across India and selected international destinations. Delivery timelines may vary based on location, customs clearance, and local courier services.</p>
            </div>
            <div className="self-end">
                
            <button  className='button border mt-3'>
                        <span className="text-wrapper" data-text="Track order"></span>
                        <div className="fill"></div>
            </button>
            </div>
            <div>

            </div>
        </div> 
            <hr className='w-[100%]' /> */}
                <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>2. Delivery Time</span></h2>
                    </div>
                    
                    <p>Delivery times vary depending on your location and the shipping method chosen. Typically, delivery within India takes 3-7 business days from the date of shipment. For international orders, delivery times may be longer, depending on customs and local delivery services.</p>
                </div>
                <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>3. Shipping Methods</span></h2>
                    </div>
                  
                    <p>We offer standard shipping through our partner logistics providers. For specific shipping options or expedited shipping, please contact our customer service.</p>
                </div>
                <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>4. Tracking</span></h2>
                    </div>
                   
                    <p>Once your order is shipped, you will receive a tracking number via email. You can use this number to track your order on the respective courier&apos;s website.</p>
                </div>
           
            <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>5. Shipping Charges</span></h2>
                    </div>
           
                    <p>Shipping charges are calculated based on the weight and destination of the package. The charges will be displayed during the checkout process.</p>
            </div>
            <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>6. Damaged or Lost Shipments</span></h2>
                    </div>
             
                    <p>If your package is damaged or lost during transit, please contact us immediately with details, and we will work with the courier to resolve the issue. In case of a lost shipment, we may reship the product or issue a refund, at our discretion.</p>
            </div>
            <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>7. International Shipping</span></h2>
                    </div>
                
                    <p>For international orders, additional customs duties, taxes, or fees may apply, which are the responsibility of the customer. We are not responsible for any delays or additional charges incurred during customs clearance.</p>
            </div>
                <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>8. Contact Us</span></h2>
                    </div>

                    <p>If you have any questions about our shipping policy, please contact us at </p>
                    <p>
                        +91 9998377554
                    </p>
                    <p>
                        +91 9825677554
                    </p>
                    <Link target='blank' href="mailto:info@iconperfumes.in">
                        info@iconperfumes.in
                    </Link>
                </div>  
            </div>
        </>
    )
}

export default ShippingPolicy
