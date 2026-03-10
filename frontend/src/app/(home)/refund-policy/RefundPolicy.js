import React from 'react'
import PageHeader from '../components/PageHeader'
import styles from '../styles/content_pages.module.css'
import Breadcrumb from '../components/BreadCrumb'

function RefundPolicy() {
  return (
    <>
          <PageHeader back_color="var(--accent-color)" heading="Refund and Return Policy for Icon Perfumes" tag={"h1"} />
    <div className={`${styles.content} padd-x mb-3 `}>
              <div className='flex mt-5 flex-col gap-2 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>1. Return Eligibility</span></h2>
                  </div>
       
                  <p>We accept returns for products that are defective, damaged during shipping, or do not match the description provided on our website. For non-defective products, we may accept returns at our discretion.</p>
        </div> 
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>2. Return Period</span></h2>
                  </div>
                      <p>For defective or damaged products, you must notify us within 7 days of receiving the product. For non-defective products, returns may be accepted within 15 days of receiving the product, subject to our approval.</p>
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>3. Return Process</span></h2>
                  </div>
                  <p>To initiate a return, please contact our customer service at [contact information] with your order details and the reason for return. We will provide you with instructions on how to return the product.</p>
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>4. Refund Process</span></h2>
                  </div>
           
                  <p>Once we receive and inspect the returned product, we will notify you of the status of your refund. If approved, we will process the refund to your original payment method within 7-10 business days.</p>
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>5. Conditions for Return</span></h2>
                </div>
                  <ul className='list-decimal !pl-4  flex flex-col gap-2'>
                    <li>
                          The product must be in its original condition, unused, and with all original packaging and accessories.
                    </li>
                      <li>For hygiene reasons, opened or used perfumes may not be eligible for return unless they are defective.</li>
                      <li> Shipping fees for returning the product are non-refundable unless the return is due to our error.</li>
                </ul>
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>6. Case-by-Case Decisions</span></h2>
                  </div>
           
                  <p>While we strive to handle all returns fairly, the final decision on whether to accept a return or issue a refund rests with Icon Perfumes. We reserve the right to make exceptions based on the specific circumstances of each case.</p>
        </div>
              <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>7. Contact Us</span></h2>
                  </div>

                  <p>If you have any questions about our refund and return policy, please contact us at [contact information].</p>
              </div>
    </div>
    </>
  )
}

export default RefundPolicy
