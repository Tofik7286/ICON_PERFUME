import React from 'react'
import PageHeader from '../components/PageHeader'
import styles from '../styles/content_pages.module.css'
import Link from 'next/link'

function PrivacyPolicy() {
  return (
    <>
          <PageHeader back_color="var(--accent-color)" heading="Privacy Policy for Icon Perfumes" tag={"h1"}/>
    <div className={`${styles.content} padd-x mb-3 `}>
              <div className='flex flex-col gap-2 mt-5 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>1. Introduction</span></h2>
                  </div>
                  <p>Icon Perfumes is committed to protecting the privacy and security of your personal data. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website or services, in compliance with the Digital Personal Data Protection Act, 2023 (DPDPA) and its rules.</p>
        </div> 
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
            <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>2. Personal Data We Collect</span></h2>
            </div>
            <ul className='list-disc !pl-4  flex flex-col gap-2'>
                      <li>We may collect the following types of personal data:
                    <ul className='list-decimal mt-2 !font-bold flex flex-col gap-2'>
                        <li>Name</li>
                        <li>Contact information (email, phone number)</li>
                        <li>Shipping Address </li>
                              <li>Payment information (if applicable)</li>
                              <li>Order history</li>
                              <li>Communication preferences</li>
                    </ul>
                </li>
            </ul>
        </div>
        
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>3. Legal Basis for Processing</span></h2>
                  </div>
            
                  <p>We process your personal data based on your consent, which you provide when you place an order or subscribe to our services. We may also process your data for other legitimate interests, such as fulfilling orders, providing customer support, and improving our services, as permitted by the DPDPA.
            </p>
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>4. Purpose of Processing</span></h2>
                  </div>
            
                  <p>Your personal data is used for the following purposes:
            </p>
            <ul className='list-decimal !pl-4  flex flex-col gap-2'>
                      <li>To process and fulfill your orders</li>
                      <li>To communicate with you about your orders and our services</li>
                      <li>To send you marketing communications, if you have consented to receive them</li>
                      <li>To improve our website and services</li>
            </ul>
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>5. Data Retention</span></h2>
                  </div>
         
                  <p>We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by law. Once the purpose is fulfilled, we will delete or anonymize your data. For inactive accounts, data may be erased after 3 years, unless you interact with our services. 
            </p>
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>6. Your Rights</span></h2>
                  </div>
          
                  <p>You have the following rights regarding your personal data:  
            </p>
            <ul className='list-decimal !pl-4  flex flex-col gap-2'>
                      <li>Right to access your personal data</li>
                      <li>Right to correct or update your personal data</li>
                      <li>Right to delete your personal data</li>
                      <li>Right to withdraw consent for processing</li>
                      <li>Right to lodge a complaint with the Data Protection Board of India (DPBI)</li>
            </ul>
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>7. Security Measures</span></h2>
                  </div>
           
                  <p>We implement appropriate technical and organizational measures to protect your personal data, including encryption, access controls, and regular backups.  
            </p>
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>8. Data Breaches</span></h2>
                  </div>
            
                  <p>In the event of a data breach, we will notify you and the DPBI within 72 hours, providing details of the breach and measures taken to mitigate it.
            </p>
        </div>
        <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>9. Children&apos;s Data</span></h2>
                  </div>
            
                  <p>Our services are not intended for children under 18 years old. If we become aware that we have collected personal data from a child without parental consent, we will take steps to delete that information. For processing children&apos;s data, we require verifiable parental consent. 
            </p>
        </div>
              <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>10. Cross-border Transfers</span></h2>
                  </div>

                  <p>If we transfer your personal data outside India, we will ensure that it is protected in accordance with the DPDPA and any applicable laws. Currently, there are no restrictions on cross-border transfers unless specified by the government.
                  </p>
              </div>
              <div className='flex flex-col gap-2 mt-4 lg:w-[80%]'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>11. Contact Us</span></h2>
                  </div>

                  <p>If you have any questions or concerns about this Privacy Policy or your personal data, please contact us at 
                  </p>
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
              <div className='flex flex-col gap-2 mt-4 lg:w-[80%] !mb-4'>
                  <div className='heading !my-0 '>
                      <h2 className='!w-full'><span>12. Changes to this Policy</span></h2>
                  </div>

                  <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting the new Privacy Policy on our website.
                  </p>
              </div>
    </div>
    </>
  )
}

export default PrivacyPolicy
