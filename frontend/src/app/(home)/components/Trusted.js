'use client'
import Image from 'next/image'
import React from 'react'
import {motion} from 'framer-motion'

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

function Trusted() {
  return (
    <div className='conatainer-fluid overflow-hidden bg-[var(--accent-color)] my-5 padd-x '>
        <div className='py-5'>
            <div className='row gx-3 gy-3'>
                <div className='col-lg-4 flex flex-col gap-3 justify-center'>
                    <div className='heading !mb-0'>
                          <motion.h4 variants={fadeUp}
                              initial="hidden"
                              whileInView="visible"
                              viewport={{ once: true, amount: 0.3 }} className='!w-full'>Icon&apos;s Valued Partners</motion.h4>
                    </div>
                      <motion.p variants={fadeUp}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, amount: 0.3 }}>Icon Perfumes is a trusted supplier for top retailers/distributors, known for our quality and customer satisfaction.</motion.p>
                </div>
                <div className='col-lg-8'>
                      <div
                           className='row gx-5 gy-5'>
                          <motion.div initial="hidden"
                              whileInView="visible"
                              variants={fadeUp}
                              viewport={{ once: true, amount: 0.3 }} className='col-lg-3 col-sm-4 col-6'>
                            <Image loading='lazy' src="/icon_images/company1.png" className='img-fluid' width={150} height={150} alt="Trusted partner"/>
                        </motion.div>
                          <motion.div initial="hidden"
                              whileInView="visible"
                              variants={fadeUp}
                              viewport={{ once: true, amount: 0.3 }} className='col-lg-3 col-sm-4 col-6'>
                              <Image loading='lazy' src="/icon_images/company2.png" className='img-fluid' width={150} height={150} alt="Trusted partner" />
                          </motion.div>
                          <motion.div initial="hidden"
                              whileInView="visible"
                              variants={fadeUp}
                              viewport={{ once: true, amount: 0.3 }} className='col-lg-3 col-sm-4 col-6'>
                              <Image loading='lazy' src="/icon_images/company3.png" className='img-fluid' width={150} height={150} alt="Trusted partner" />
                          </motion.div>      <motion.div initial="hidden"
                              whileInView="visible"
                              variants={fadeUp}
                              viewport={{ once: true, amount: 0.3 }} className='col-lg-3 col-sm-4 col-6'>
                              <Image loading='lazy' src="/icon_images/company4.png" className='img-fluid' width={150} height={150} alt="Trusted partner" />
                          </motion.div>      <motion.div initial="hidden"
                              whileInView="visible"
                              variants={fadeUp}
                              viewport={{ once: true, amount: 0.3 }} className='col-lg-3 col-sm-4 col-6'>
                              <Image loading='lazy' src="/icon_images/company5.png" className='img-fluid' width={150} height={150} alt="Trusted partner" />
                          </motion.div>      <motion.div initial="hidden"
                              whileInView="visible"
                              variants={fadeUp}
                              viewport={{ once: true, amount: 0.3 }} className='col-lg-3 col-sm-4 col-6'>
                              <Image loading='lazy'  src="/icon_images/company6.png" className='img-fluid' width={150} height={150} alt="Trusted partner" />
                          </motion.div>      <motion.div initial="hidden"
                              whileInView="visible"
                              variants={fadeUp}
                              viewport={{ once: true, amount: 0.3 }} className='col-lg-3 col-sm-4 col-6'>
                              <Image loading='lazy' src="/icon_images/company7.png" className='img-fluid' width={150} height={150} alt="Trusted partner" />
                          </motion.div>      <motion.div initial="hidden"
                              whileInView="visible"
                              variants={fadeUp}
                              viewport={{ once: true, amount: 0.3 }} className='col-lg-3 col-sm-4 col-6'>
                              <Image loading='lazy'  src="/icon_images/company8.png" className='img-fluid' width={150} height={150} alt="Trusted partner" />
                          </motion.div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Trusted
