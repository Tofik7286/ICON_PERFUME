import React from 'react'
import PageHeader from '../components/PageHeader'
import styles from '../styles/content_pages.module.css'
import Breadcrumb from '../components/BreadCrumb'
import Link from 'next/link'

function PayMethods() {
  return (
    <>
      <PageHeader back_color="var(--accent-color)" heading="Payment Terms for Icon Perfumes" tag={"h1"} />
      <div className={`${styles.content} padd-x mb-3`}>
        <div className='flex flex-col gap-2 mt-5 lg:w-[80%]'>
          <div className='heading !my-0 '>
            <h2 className='!w-full'><span>1. Accepted Payment Methods</span></h2>
          </div>
         
          <p>We accept the following payment methods:</p>
          <ul className='list-disc !pl-4  flex flex-col gap-2'>
            <li><b>Credit/Debit Cards (Visa, MasterCard, etc.)</b></li>
            <li><b>Net Banking</b></li>
            <li><b>UPI</b></li>
            <li><b>Pay on Delivery (Cash or Digital Payments)</b></li>
          </ul>
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
          <div className='heading !my-0 '>
            <h2 className='!w-full'><span>2. Prepaid Payments</span></h2>
          </div>
         
          <p>For prepaid payments, the payment is processed at the time of order placement. Once the payment is successful, your order will be processed for shipping.</p>
         
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
          <div className='heading !my-0 '>
            <h2 className='!w-full'><span>3. Pay on Delivery</span></h2>
          </div>
         
          <p>For Pay on Delivery, you can pay in cash or through digital payment methods at the time of delivery. Please note that Pay on Delivery is available only for certain areas and may not be available for all orders.</p>
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
          <div className='heading !my-0 '>
            <h2 className='!w-full'><span>4. Payment Security</span></h2>
          </div>
       
            <p>We use secure payment gateways to ensure the safety of your payment information. We do not store your payment details on our servers. </p>
          
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
          <div className='heading !my-0 '>
            <h2 className='!w-full'><span>5. Refunds for Prepaid Payments</span></h2>
          </div>
          
          <p>In case of a return or cancellation, refunds for prepaid payments will be processed to the original payment method within 7-10 business days.</p>
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
          <div className='heading !my-0 '>
            <h2 className='!w-full'><span>6. Contact Us</span></h2>
          </div>
          
          <p>If you have any questions about our payment terms, please contact us at </p>
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

export default PayMethods
