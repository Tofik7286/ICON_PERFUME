'use client'
import Image from 'next/image'
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

function Wellness() {
    // Refs
    const leftRef = useRef(null)
    const rightRef = useRef(null)
    const headingRef = useRef(null)
    const subheadingRef = useRef(null)
    const paraRef = useRef(null)
    const buttonRef = useRef(null)

    // InView states
    const leftInView = useInView(leftRef, { once: true, margin: "-100px 0px" })
    const rightInView = useInView(rightRef, { once: true, margin: "-100px 0px" })
    const headingInView = useInView(headingRef, { once: true, margin: "-50px 0px" })
    const subheadingInView = useInView(subheadingRef, { once: true, margin: "-50px 0px" })
    const paraInView = useInView(paraRef, { once: true, margin: "-50px 0px" })
    const buttonInView = useInView(buttonRef, { once: true, margin: "-50px 0px" })

    // Animation variants
    const slideIn = {
        hidden: { x: -100, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    }

    const fadeUp = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    }

    return (
        <div className='bg-[var(--accent-color)] overflow-hidden py-[3em] my-[3em]'>
            <div className='container-fluid padd-x'>
                <div className='row gx-5 gy-2'>

                    {/* Left Images */}
                    <div className='col-md-3'>
                        <motion.div
                            ref={leftRef}
                            className='relative w-full min-h-[7em] h-full'
                            initial="hidden"
                            animate={leftInView ? "visible" : "hidden"}
                            variants={slideIn}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        >
                            <div className='absolute top-0 left-0 w-[7em] h-[7em] overflow-hidden rounded-full'>
                                <Image loading='lazy' className='object-cover h-full w-full' src="/icon_images/Exotica 1.webp" width={1000} height={1000} alt='exotica icon perfume' />
                            </div>
                            <div className='absolute top-[45%] right-0 w-[5em] h-[5em] overflow-hidden rounded-full'>
                                <Image loading='lazy' className='object-cover h-full w-full' src="/icon_images/Amir 1.webp" width={1000} height={1000} alt='amir 1 icon perfume' />
                            </div>
                            <div className='absolute hidden md:block bottom-0 left-0 w-[7em] h-[7em] overflow-hidden rounded-full'>
                                <Image loading='lazy' className='object-cover h-full w-full' src="/icon_images/Signature 1.webp" width={1000} height={1000} alt='Signature icon perfume' />
                            </div>
                        </motion.div>
                    </div>

                    {/* Center Text */}
                    <div className='col-md-6 py-[2em] flex justify-center'>
                        <div className='flex lg:w-[90%] text-center flex-col gap-4 items-center justify-center'>
                            <motion.p
                                ref={subheadingRef}
                                initial="hidden"
                                animate={subheadingInView ? "visible" : "hidden"}
                                variants={fadeUp}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                className='uppercase'
                            >
                               Iconic Scents - 
                            </motion.p>

                            <motion.div
                                ref={headingRef}
                                initial="hidden"
                                animate={headingInView ? "visible" : "hidden"}
                                variants={fadeUp}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className='heading !my-0'
                            >
                                <h2 className='!w-full !text-[var(--heading-color2)]'>
                                That Define Your Presence  
                                Our Fragrance, Your Story 
                                </h2>
                            </motion.div>

                            <motion.p
                                ref={paraRef}
                                initial="hidden"
                                animate={paraInView ? "visible" : "hidden"}
                                variants={fadeUp}
                                transition={{ duration: 0.4, delay: 0.3 }}
                            >
                               At Icon Perfumes, we meticulously blend high-quality ingredients to create captivating attars and perfumes. Our alcohol-free formulations offer long-lasting aromatic experiences, embodying both tradition and modern elegance. Discover your signature scent. 
                            </motion.p>
                            <motion.div variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}>
                                <Link aria-label='Learn More With us' className="button border" href="/contact/"><span className="text-wrapper" data-text="Learn More"></span><div className="fill"></div></Link>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Images */}
                    <div className='col-md-3'>
                        <motion.div
                            ref={rightRef}
                            className='relative w-full min-h-[7em] h-full'
                            initial="hidden"
                            animate={rightInView ? "visible" : "hidden"}
                            variants={{
                                hidden: { x: 100, opacity: 0 },
                                visible: { x: 0, opacity: 1 }
                            }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        >
                            <div className='absolute top-0 right-0 w-[7em] h-[7em] overflow-hidden rounded-full'>
                                <Image loading='lazy' className='object-cover h-full w-full' src="/icon_images/Pure Wonder 1.webp" width={1000} height={1000} alt='Pure wonder icon perfume' />
                            </div>
                            <div className='absolute top-[45%] left-0 w-[5em] h-[5em] overflow-hidden rounded-full'>
                                <Image loading='lazy' className='object-cover h-full w-full' src="/icon_images/Swiss Firdaus 1.webp" width={1000} height={1000} alt='Swiss Firdaus Icon perfume' />
                            </div>
                            <div className='absolute hidden md:block bottom-0 right-0 w-[7em] h-[7em] overflow-hidden rounded-full'>
                                <Image loading='lazy' className='object-cover h-full w-full' src="/icon_images/Khamrah 1.webp" width={1000} height={1000} alt='Khamrah icon perfume' />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Wellness