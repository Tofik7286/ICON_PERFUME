    'use client'
import React, { useState } from 'react'
import styles from '../styles/contactus.module.css'
import { BsArrowDown } from "react-icons/bs";
import Link from 'next/link';

function Faq({page}) {
    const [active, setActive] = useState(-1);

    const handleClick = (i) => {
        if (active === i) {
            setActive(-1)
        }
        else {
            setActive(i)
        }
    }
    
    const faq_list = [
        {
            question: "How long does delivery take?",
            answers: "Orders are usually delivered within 3–5 business days, depending on your location.",
        },
        {
            question: "Are all perfumes alcohol-free?",
            answers: "Yes, all Icon Perfumes are 100% alcohol-free and skin safe. "
        },
        {
            question: "Can I return or exchange a product?",
            answers: "Yes, you can request a return or exchange within 7 days of delivery."
        },
        {
            question: "How can I track my order?",
            answers: "You’ll receive a tracking link via SMS and email once your order is shipped."
        },
        {
            question: "Do you offer bulk or retailer discounts?",
            answers: "Yes, we offer special pricing for bulk and retail partners. Contact us for details. ",
        },
        // {
        //     question: "What’s your MOQ (Minimum Order Quantity)?",
        //     answers: "It varies by product category, but we aim to stay flexible for both small and large-scale buyers."
        // },
        // {
        //     question: "How long does shipping usually take?",
        //     answers: "Shipping time depends on the destination country and mode (air or sea). Typically, deliveries range from 10 to 30 days."
        // },
        // {
        //     question: "Can I request custom packaging or labeling?",
        //     answers: "Yes, we offer export-grade packaging and can include your branding or custom labels as needed."
        // },
        // {
        //     question: "What types of Indian products do you export? ",
        //     answers: "We export handicrafts, imitation jewellery, household utility items, organic products, ceramics, and industrial supplies — all sourced from verified suppliers.",
        // },
        // {
        //     question: "What’s your MOQ (Minimum Order Quantity)?",
        //     answers: "It varies by product category, but we aim to stay flexible for both small and large-scale buyers."
        // },
        // {
        //     question: "How long does shipping usually take?",
        //     answers: "Shipping time depends on the destination country and mode (air or sea). Typically, deliveries range from 10 to 30 days."
        // },
        // {
        //     question: "Can I request custom packaging or labeling?",
        //     answers: "Yes, we offer export-grade packaging and can include your branding or custom labels as needed."
        // },
        // {
        //     question: "What types of Indian products do you export? ",
        //     answers: "We export handicrafts, imitation jewellery, household utility items, organic products, ceramics, and industrial supplies — all sourced from verified suppliers.",
        // },
        // {
        //     question: "What’s your MOQ (Minimum Order Quantity)?",
        //     answers: "It varies by product category, but we aim to stay flexible for both small and large-scale buyers."
        // },
        // {
        //     question: "How long does shipping usually take?",
        //     answers: "Shipping time depends on the destination country and mode (air or sea). Typically, deliveries range from 10 to 30 days."
        // },
        // {
        //     question: "Can I request custom packaging or labeling?",
        //     answers: "Yes, we offer export-grade packaging and can include your branding or custom labels as needed."
        // },

    ]
  return (
    <div className='container-fluid text-[var(--font)] padd-x'>
        <div className='py-[3em]'>
            <div className='row gx-3 gy-3'>
                <div className='col-lg-6'>
                    <div className='flex lg:sticky top-[20%] flex-col gap-3'>
                        <p className='uppercase'>
                        Everything You <span className='p-1 bg-[var(--accent-color)] rounded'>Need to Know</span>
                        </p>
                        <div className='heading !my-0'>
                            <h2 className='!mb-0 !w-full lg:!w-[70%]'>
                                Frequently asked
                                questions
                            </h2>
                        </div>
                        <p>Our FAQs address common questions, helping you find simple answers related to orders, delivery, and choosing the right fragrance. We&apos;re here to make your experience smooth and informed. If you have more questions, feel free to reach out. </p>
                        <div className='border border-black p-4 gap-2 flex flex-col md:flex-row justify-between md:items-center'>
                            <div>
                                <h4>Need Instant Support?</h4>
                                <p className='mt-1 '>Get in touch via WhatsApp </p>
                            </div>
                              <Link target='blank' href="https://wa.me/+919998377554">
                                <button className='rounded-full w-fit text-nowrap px-4 py-2 border border-black'>
                                WhatsApp Us
                                </button>
                            </Link>
                        </div>
                        {
                            page!='faq' &&
                            <Link href="/faqs">
                                <button className='w-fit rounded-full text-nowrap px-5 py-2 border border-black'>
                                View All FAQs
                                    </button>
                            </Link>
                         }
                    </div>
                </div>
                  <div className='col-lg-6'>
                      <div className={`${styles.faq_all} lg:px-5 flex flex-col`}>
                          {
                              faq_list.map((items, i) => {
                                  return (
                                      <div onClick={() => handleClick(i)} key={i} className={`${styles.faq_items} cursor-pointer  ${active === i ? styles.active : styles.not_active}  py-4`}>
                                          <div className={styles.questions}>
                                            <div className='rounded-full  min-w-[2em] min-h-[2em] flex justify-center items-center border border-black bg-[var(--accent-color)]'>
                                                {i+1}
                                            </div>
                                              <h4>{items.question}</h4>
                                              <div className='w-[2em] h-[2em] border border-black flex p-1 justify-center items-center bg-[var(--accent-color)] rounded-full absolute bottom-[-12%] right-0'>
                                                  <BsArrowDown size={15} />
                                              </div>
                                          </div>

                                          {/* ❗ Always render this — don't conditionally hide with && */}
                                          <div className={`${styles.answers_div} ${active === i ? 'animating-open' : 'animating-close'}`}>
                                              <hr className='mt-2' />
                                              <p  className={styles.answers}>{items.answers}</p>
                                          </div>
                                      </div>

                                  )
                              })
                          }

                      </div>
                  </div>
            </div>
        </div>
    </div>
  )
}

export default Faq
