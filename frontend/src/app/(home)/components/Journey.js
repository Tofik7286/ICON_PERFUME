'use client'
import Image from 'next/image'
import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: 'easeOut'
        }
    }
}
const zoomIn = {
    hidden: { scale: 1 },
    visible: {
        scale: 1.2,
        transition: {
            duration: 2
        }
    }
}

function Journey() {
    return (
        <div className='container-fluid text-[var(--font)] padd-x mt-4 '>
            <div className=''>
                <div className='row gx-3 gy-3'>
                    <div className='col-lg-4 flex flex-col justify-center gap-3'>
                        <div className='heading !my-0'>
                            <motion.h2 variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }} className='!w-full'>Latest From Our Blog</motion.h2>
                        </div>
                        <motion.p variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.3 }} >Heading of latest uploaded Blog</motion.p>
                        <div>
                            <Link aria-label='View All Blogs' className="button border" href="/blogs/"><span className="text-wrapper" data-text="View all Blogs"></span><div className="fill"></div></Link>
                        </div>
                    </div>
                    <div className='col-lg-4 col-sm-6 '>
                        <div className='overflow-hidden'>
                            <motion.div variants={zoomIn}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }} >
                                <Image loading='lazy' src="/icon_images/yara_attar.webp" alt='yara attar journey icon perfume' width={1000} height={1000} className='img-fluid' />
                            </motion.div>
                        </div>
                    </div>
                    <div className='col-lg-4 col-sm-6  '>
                        <div className='overflow-hidden'>
                            <motion.div variants={zoomIn}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }} >
                                <Image loading='lazy' src="/icon_images/yara_attar1.webp"  alt='yara attar 1 journey icon perfume' width={1000} height={1000} className='img-fluid' />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Journey
