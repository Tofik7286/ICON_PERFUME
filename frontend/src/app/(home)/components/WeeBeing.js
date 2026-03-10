'use client'
import Image from 'next/image'
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

function WeeBeing() {
    // Refs for animation triggers
    const containerRef = useRef(null)
    const subheadingRef = useRef(null)
    const headingRef = useRef(null)
    const paraRef = useRef(null)
    const buttonRef = useRef(null)
    const imageRef = useRef(null)
    const teamImagesRef = useRef(null)

    // Animation triggers
    const containerInView = useInView(containerRef, { once: true, margin: "-100px 0px" })
    const subheading = useInView(subheadingRef, { once: true, margin: "-50px 0px" })
    const heading = useInView(headingRef, { once: true, margin: "-50px 0px" })
    const para = useInView(paraRef, { once: true, margin: "-50px 0px" })
    const button = useInView(buttonRef, { once: true, margin: "-50px 0px" })
    const imageInView = useInView(imageRef, { once: true, margin: "-100px 0px" })
    const teamInView = useInView(teamImagesRef, { once: true, margin: "-50px 0px" })

    // Animation variants
    const fadeUp = {
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    }

    const slideIn = {
        hidden: { x: 100, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    }

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const teamImage = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: { scale: 1, opacity: 1 }
    }

    return (
        <motion.div
            className='well-being padd-x overflow-x-hidden container-fluid'
            ref={containerRef}
            initial="hidden"
            animate={containerInView ? "visible" : "hidden"}
           
        >
            <div className=''>
                <div className='row bg-[var(--accent-color)] gx-3 gy-3'>
                    {/* Text Content */}
                    <motion.div
                        className='col-lg-6 !mt-0 flex flex-col justify-center items-center text-center gap-4 lg:gap-5 py-5 px-4 lg:!px-[5em]'
                      
                    >
                        <motion.p
                        ref={subheadingRef}
                         className='uppercase'
                         initial="hidden"
                            variants={fadeUp}
                            animate={subheading?"visible":"hidden"}
                            transition={{ duration: 0.4,delay:0.1 }}
                        
                        >
                           Scent with Trust
                        </motion.p>

                        <motion.div
                        ref={headingRef}
                            className='heading !my-0'
                            initial="hidden"
                            variants={fadeUp}
                            animate={heading ? "visible" : "hidden"}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <h2 className='!w-full !text-[var(--heading-color2)]'>
                            Experience the Quality of Alcohol-Free Fragrance
                            </h2>
                        </motion.div>

                        <motion.p
                        ref={paraRef}
                            initial="hidden"
                            variants={fadeUp}
                            animate={para ? "visible" : "hidden"}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            Choose Icon Perfumes for reliable, affordable, and long-lasting attars and roll-on perfumes. Our alcohol-free formulations are gentle on the skin and offer a pure, concentrated fragrance experience. 
                        </motion.p>

                        <motion.div
                        ref={buttonRef}
                            initial="hidden"
                            variants={fadeUp}
                            animate={button ? "visible" : "hidden"}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <Link className="button border" href="/contact/">
                                <span className="text-wrapper" data-text="Contact Us">Contact Us</span>
                                <div className="fill"></div>
                            </Link>
                        </motion.div>

                        <motion.div
                            className='flex'
                            ref={teamImagesRef}
                            initial="hidden"
                            animate={teamInView ? "visible" : "hidden"}
                            variants={staggerContainer}
                        >
                            {["Amir 1", "oudh_perfume", "Khamrah 1", "shabaya_perfumes"].map((item, index) => (
                                <motion.div
                                    key={index}
                                    className='w-[5em] border-2 border-black bg-white ml-[-20px] h-[5em] rounded-full overflow-hidden'
                                    variants={teamImage}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Image
                                        className='object-cover rounded-full h-full w-full'
                                        src={`/icon_images/${item}.webp`}
                                        loading='lazy'
                                        width={1000}
                                        height={1000}
                                        alt={`Team member ${item}`}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Image */}
                    <motion.div
                        className='col-lg-6 !mt-0'
                        ref={imageRef}
                        initial="hidden"
                        animate={imageInView ? "visible" : "hidden"}
                        variants={slideIn}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <Image
                            src="/icon_images/view-music-box-with-bohemian-decor 1.webp"
                            width={1000}
                            height={1000}
                            loading='lazy'
                            alt="Bohemian decor Attar Icon perfume"
                            className='w-full h-auto'
                        />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}

export default WeeBeing