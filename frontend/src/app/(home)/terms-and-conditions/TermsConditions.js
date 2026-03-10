import React from 'react'
import PageHeader from '../components/PageHeader'
import styles from '../styles/content_pages.module.css'
import Breadcrumb from '../components/BreadCrumb'
import Link from 'next/link'

function TermsConditions() {
    return (
        <>
            <PageHeader heading={"Terms and Conditions for Icon Perfumes"} back_color="var(--accent-color)" tag={"h1"} />
            <div className={`${styles.content} padd-x mb-3`}>
                <div className='flex flex-col  mt-5 gap-2 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>1. Acceptance of Terms</span></h2>
                    </div> 
                    <p>By placing an order or using our website, you agree to be bound by these Terms and Conditions. If you do not agree with these terms, please do not use our website or place any orders.</p>
                </div>
                <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>2. Order Acceptance</span></h2>
                    </div>
                    <p>Your order is an offer to buy from us. We will send you an email confirming receipt of your order, but this does not mean that your order has been accepted. Your order constitutes an offer to us to buy a Product. All orders are subject to acceptance by us, and we will confirm such acceptance to you by sending you an email that confirms that your Product has dispatched (Dispatch Confirmation). The contract between us will only be formed when we send you the Dispatch Confirmation.</p>
                </div>
                <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>3. Pricing and Payment</span></h2>
                    </div>
                    <p>All prices are in Indian Rupees (INR) and include all applicable taxes. Prices are subject to change without notice, but changes will not affect orders that have already been placed.</p>
                </div>
                <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>4. Delivery</span></h2>
                    </div>
                  
                    <p> We will deliver your order to the address you provide during checkout. You are responsible for ensuring that the delivery address is correct. If you are not available to receive the delivery, the courier may leave the package with a neighbor or at a safe location, as per their policy.</p>
                </div>
                <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>5. Returns and Refunds</span></h2>
                    </div>
                 
                    <p>Please refer to our Refund and Return Policy for details on how to return products and request refunds.</p>
                </div>
                <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>6. Intellectual Property</span></h2>
                    </div>
                    <p>All content on our website, including text, graphics, logos, images, and software, is the property of Icon Perfumes or its suppliers and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from any content on our website without our prior written consent.</p>
                </div>
                <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>7. Limitation of Liability</span></h2>
                    </div>
                    <p>Icon Perfumes shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our website or products, even if we have been advised of the possibility of such damages.</p>
                </div>
                <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>8. Governing Law</span></h2>
                    </div>
                 
                    <p>These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with these Terms and Conditions shall be subject to the exclusive jurisdiction of the courts in [city, state].</p>
                </div>
                <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>9. Changes to Terms</span></h2>
                    </div>
                   
                    <p>We may update these Terms and Conditions from time to time. We will notify you of any changes by posting the new Terms and Conditions on our website. Your continued use of our website after such changes constitutes your acceptance of the new Terms and Conditions.</p>
                </div>
                <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                    <div className='heading !my-0 '>
                        <h2 className='!w-full'><span>10. Contact Us</span></h2>
                    </div>
                   
                    <p>If you have any questions about these Terms and Conditions, please contact us at </p>
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

export default TermsConditions
