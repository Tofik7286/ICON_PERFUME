'use client'
import Image from 'next/image'
import React from 'react'
import { motion, useInView } from 'framer-motion'

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
    hidden:{scale:1},
    visible:{
        scale:1.2,
        transition:{
            duration:2
        }
    }
}

function Icon_whychoose() {
    return (
        <div className='container-fluid text-[var(--font)] padd-x'>
            <div className='row mt-4 gx-3 gy-3'>
                <div className='col-lg-8'>
                    <div className='row h-[45%] md:h-[50%] gx-3 gy-3'>

                        <div className='col-md-6'>
                            <motion.div
                                className='h-fit flex flex-col gap-2'
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                            >
                                <p className='uppercase'>Quality, Value, and Fragrance</p>
                                <div className='heading !my-0'>
                                    <h2 className='!w-full'>
                                    Why Our Customers Love Icon Perfumes
                                    </h2>
                                </div>
                            </motion.div>
                        </div>

                        <div className='col-md-6'>
                            <div className='flex h-full flex-col gap-2 justify-between p-3 bg-[var(--accent-color)]'>
                                <Image loading='lazy' src="/icon_images/flower.png" width={100} height={100} alt="Pure Oils" />
                                <motion.div
                                    className='flex flex-col gap-3 justify-between'
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }}
                                >
                                    <h4>Pure Oils</h4>
                                    <p>
                                    We use 100% natural oils for longer-lasting, authentic fragrance experiences.
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    <div className='row mt-3 h-[45%] md:h-[50%] gx-3 gy-3'>
                        <div className='col-md-6'>
                            <div className='flex h-full flex-col gap-2 justify-between p-3 bg-[var(--accent-color)]'>
                                <Image loading='lazy' src="/icon_images/skin.png" width={100} height={100} alt="Hand Blended Icon Perfume" />
                                <motion.div
                                    className='flex flex-col gap-3 justify-between'
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }}
                                >
                                    <h4>Hand Blended </h4>
                                    <p>
                                    Each bottle is handcrafted with care by fragrance artisans.
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        <div className='col-md-6'>
                            <div className='flex h-full flex-col gap-2 justify-between p-3 bg-[var(--accent-color)]'>
                                <Image loading='lazy' src="/icon_images/long_lasting.png" width={100} height={100} alt="Long-lasting Fragrance icon perfume" />
                                <motion.div
                                    className='flex flex-col gap-3 justify-between'
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }}
                                >
                                    <h4>Long-lasting </h4>
                                    <p>
                                    Designed to linger on your skin and in your memory.
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='col-lg-4 overflow-hidden'>
                    <motion.div variants={zoomIn} initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}  className='h-full !mt-[6em] lg:!mt-0'>
                        <Image
                            src="/icon_images/exotica_attar.webp"
                            width={1000}
                            height={1000}
                            loading='lazy'
                            alt="exotica_attar whychoose"
                            className='h-full w-full object-cover'
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default Icon_whychoose
