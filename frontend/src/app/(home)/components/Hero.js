'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
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

function Hero() {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    // Delay animations until after LCP has likely completed
    const timer = setTimeout(() => setAnimate(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container-fluid hero-my padd-x">
      <div className="py-[2em]">
        <div className='row gx-3 gy-3'>
          <div className='col-lg-6 '>
            <div className='lg:w-[75%] h-full flex flex-col gap- justify-between  lg:gap-5'>
              <div className='flex  flex-col gap-3 lg:gap-5'>
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate={animate ? "visible" : "hidden"}
                  className='heading !my-0'
                >
                  <h1 className='!w-full'>
                  Discover Finest Alcohol-Free Attars
                  </h1>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate={animate ? "visible" : "hidden"}
                  className='flex gap-3 items-center'
                >
                  <Link className="button border" href="/about/">
                    <span className="text-wrapper" data-text="Contact Us"></span>
                    <div className="fill"></div>
                  </Link>
                  <Link className='!font-medium !text-sm' href="">View All Products</Link>
                </motion.div>
              </div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate={animate ? "visible" : "hidden"}
                className='flex gap-2 justify-center items-center p-[3em] bg-[var(--accent-color)]'
              >
                <div className="left_line"></div>
                <p className='text-center !font-medium'>
                Discover exquisite, long-lasting attars and roll-on perfumes crafted with care. Experience captivating fragrances without the use of alcohol.
                </p>
                <div className='right_line'></div>
              </motion.div>
            </div>
          </div>

          <div className='col-lg-6'>
            <div className='row'>
              <div className='col-5'>
                <Image
                  src="/icon_images/hero_img1.webp"
                  width={1000}
                  height={1000}
                  className='img-fluid'
                  alt='Hero 1'
                />
              </div>
              <div className='col-7'>
                <Image
                  priority
                  loading='eager'
                  src="/icon_images/hero_img2.webp"
                  width={1000}
                  height={1000}
                  className='img-fluid'
                  alt='Hero 2'
                />
                <p className='mt-3'>
                  Where each product tells a story of grace, confidence, and the timeless allure that is uniquely yours.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Hero
